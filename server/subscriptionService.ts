import crypto from 'crypto';
import { adminDb } from './firebaseAdmin';

export interface Entitlements {
  userId: string;
  isPremium: boolean;
  isTrialActive: boolean;
  trialExpired: boolean;
  daysRemaining: number;
  plan: 'free_trial' | 'premium' | 'expired';
  status: 'trial' | 'active' | 'expired' | 'cancelled';
  expiresAt: number;
}

const TRIAL_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 days in ms
const MONTH_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
const SUBSCRIPTION_AMOUNT_KOBO = 100000; // ₦1,000 in kobo

/**
 * Authoritatively retrieves or initializes user subscription & trial state.
 */
export async function getUserEntitlements(userId: string, email?: string): Promise<Entitlements> {
  const subRef = adminDb.collection('subscriptions').doc(userId);
  const subSnap = await subRef.get();
  const now = Date.now();

  if (!subSnap.exists) {
    // Check if user has an existing user profile to preserve creation time if available
    let trialStart = now;
    try {
      const userSnap = await adminDb.collection('users').doc(userId).get();
      if (userSnap.exists && userSnap.data()?.createdAt) {
        trialStart = userSnap.data()?.createdAt;
      }
    } catch (e) {}

    const trialExpiresAt = trialStart + TRIAL_DURATION_MS;
    const isExpired = now > trialExpiresAt;

    const newSubData = {
      userId,
      status: isExpired ? 'expired' : 'trial',
      plan: isExpired ? 'expired' : 'free_trial',
      trialStartedAt: trialStart,
      trialExpiresAt,
      subscriptionStartedAt: 0,
      expiresAt: isExpired ? 0 : trialExpiresAt,
      amountPaid: 0,
      updatedAt: now
    };

    await subRef.set(newSubData);

    const remainingMs = Math.max(0, trialExpiresAt - now);
    const daysRemaining = Number((remainingMs / (24 * 60 * 60 * 1000)).toFixed(1));

    return {
      userId,
      isPremium: false,
      isTrialActive: !isExpired,
      trialExpired: isExpired,
      daysRemaining,
      plan: isExpired ? 'expired' : 'free_trial',
      status: isExpired ? 'expired' : 'trial',
      expiresAt: trialExpiresAt
    };
  }

  const sub = subSnap.data()!;
  
  // Check active paid subscription
  if (sub.status === 'active' && sub.expiresAt && sub.expiresAt > now) {
    const remainingMs = Math.max(0, sub.expiresAt - now);
    const daysRemaining = Number((remainingMs / (24 * 60 * 60 * 1000)).toFixed(1));
    return {
      userId,
      isPremium: true,
      isTrialActive: false,
      trialExpired: false,
      daysRemaining,
      plan: 'premium',
      status: 'active',
      expiresAt: sub.expiresAt
    };
  }

  // Check trial
  const trialExpiresAt = sub.trialExpiresAt || (sub.trialStartedAt ? sub.trialStartedAt + TRIAL_DURATION_MS : now);
  const isTrialActive = now <= trialExpiresAt;
  const daysRemaining = Number((Math.max(0, trialExpiresAt - now) / (24 * 60 * 60 * 1000)).toFixed(1));

  if (!isTrialActive && sub.status !== 'expired') {
    await subRef.update({ status: 'expired', updatedAt: now });
  }

  return {
    userId,
    isPremium: false,
    isTrialActive,
    trialExpired: !isTrialActive,
    daysRemaining,
    plan: isTrialActive ? 'free_trial' : 'expired',
    status: isTrialActive ? 'trial' : 'expired',
    expiresAt: trialExpiresAt
  };
}

/**
 * Verifies if user has active trial or active subscription. Throws if expired.
 */
export async function checkAccessOrThrow(userId: string, email?: string): Promise<Entitlements> {
  const entitlements = await getUserEntitlements(userId, email);
  if (!entitlements.isPremium && !entitlements.isTrialActive) {
    const error: any = new Error("Your 3-day free trial has expired. Upgrade for ₦1,000/month to continue learning.");
    error.code = 'TRIAL_EXPIRED';
    error.status = 403;
    throw error;
  }
  return entitlements;
}

/**
 * Initializes a payment intent authoritative on the server.
 */
export async function initializePayment(userId: string, email: string) {
  const now = Date.now();
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  const reference = `DEMO_${userId.substring(0, 5)}_${now}_${rand}`;

  // Store pending payment in authoritative Firestore payments collection
  const paymentDoc = {
    userId,
    reference,
    amount: SUBSCRIPTION_AMOUNT_KOBO,
    currency: 'NGN',
    status: 'pending',
    customerEmail: email,
    createdAt: now
  };

  await adminDb.collection('payments').doc(reference).set(paymentDoc);

  return {
    reference,
    amount: SUBSCRIPTION_AMOUNT_KOBO,
    currency: 'NGN',
    email,
    publicKey: process.env.VITE_PAYSTACK_PUBLIC_KEY || ''
  };
}

/**
 * Authoritatively verifies a Paystack payment and updates subscription state.
 */
export async function verifyPayment(reference: string, authenticatedUserId: string) {
  const paymentRef = adminDb.collection('payments').doc(reference);
  const paymentSnap = await paymentRef.get();

  // Check idempotency
  if (paymentSnap.exists) {
    const pData = paymentSnap.data();
    if (pData?.status === 'success') {
      return {
        status: 'success',
        message: 'Payment already verified and active.',
        reference
      };
    }
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  let verified = false;
  let paystackData: any = null;

  if (secretKey && secretKey.trim().length > 0) {
    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: {
          Authorization: `Bearer ${secretKey.trim()}`
        }
      });
      const json = await response.json();
      if (json.status && json.data) {
        paystackData = json.data;
        if (
          paystackData.status === 'success' &&
          paystackData.amount >= SUBSCRIPTION_AMOUNT_KOBO &&
          paystackData.currency === 'NGN'
        ) {
          verified = true;
        } else {
          throw new Error(`Paystack transaction validation failed: ${paystackData.gateway_response || 'Invalid state'}`);
        }
      }
    } catch (err: any) {
      console.error('Paystack verification call error:', err);
      throw new Error(`Payment verification failed: ${err.message}`);
    }
  } else {
    // If secret key is not provided in dev/preview environment, verify reference format and complete authoritative transaction
    console.warn("PAYSTACK_SECRET_KEY not set in environment. Verifying reference format for sandbox simulation.");
    if (reference && reference.startsWith('DEMO_')) {
      verified = true;
      paystackData = {
        status: 'success',
        amount: SUBSCRIPTION_AMOUNT_KOBO,
        currency: 'NGN',
        channel: 'card',
        simulated: true
      };
    } else {
      throw new Error("Invalid transaction reference.");
    }
  }

  if (!verified) {
    throw new Error("Transaction verification unconfirmed by gateway.");
  }

  const now = Date.now();
  const expiresAt = now + MONTH_MS;

  // 1. Authoritatively update payments record
  await paymentRef.set({
    userId: authenticatedUserId,
    reference,
    amount: SUBSCRIPTION_AMOUNT_KOBO,
    currency: 'NGN',
    status: 'success',
    paidAt: now,
    paystackResponse: paystackData,
    updatedAt: now
  }, { merge: true });

  // 2. Authoritatively update subscriptions record
  const subRef = adminDb.collection('subscriptions').doc(authenticatedUserId);
  await subRef.set({
    userId: authenticatedUserId,
    status: 'active',
    plan: 'premium',
    subscriptionStartedAt: now,
    expiresAt,
    amountPaid: 1000,
    lastPaymentReference: reference,
    updatedAt: now
  }, { merge: true });

  // 3. Sync user profile flags
  try {
    await adminDb.collection('users').doc(authenticatedUserId).set({
      isPremium: true,
      isSubscribed: true,
      subscription: {
        plan: 'premium',
        expiresAt: new Date(expiresAt).toISOString()
      }
    }, { merge: true });
  } catch (e) {
    console.error("Error updating user document:", e);
  }

  // 4. Log to audit log
  try {
    await adminDb.collection('admin_audit_logs').add({
      adminId: 'system_paystack',
      action: 'SUBSCRIPTION_ACTIVATED',
      targetUserId: authenticatedUserId,
      details: { reference, amount: 1000, expiresAt },
      timestamp: now
    });
  } catch (e) {}

  return {
    status: 'success',
    message: 'Subscription successfully upgraded to Premium for ₦1,000/month!',
    expiresAt
  };
}

/**
 * Handles Paystack webhooks idempotently with signature verification.
 */
export async function handlePaystackWebhook(rawBody: string, signature: string) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (secretKey) {
    const hash = crypto.createHmac('sha512', secretKey).update(rawBody).digest('hex');
    if (hash !== signature) {
      throw new Error('Invalid Paystack signature');
    }
  }

  const event = JSON.parse(rawBody);
  if (event.event === 'charge.success' && event.data) {
    const { reference, metadata, customer } = event.data;
    const userId = metadata?.userId || (reference.includes('_') ? reference.split('_')[1] : null);

    if (userId) {
      await verifyPayment(reference, userId);
    }
  }

  return { received: true };
}
