import crypto from 'crypto';
import { supabaseAdmin } from './supabase';

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

export const TRIAL_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 days in ms
export const MONTH_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
export const SUBSCRIPTION_AMOUNT_KOBO = 100000; // ₦1,000 in kobo

/**
 * Authoritatively retrieves or initializes user subscription & trial state from Supabase.
 */
export async function getUserEntitlements(userId: string, _email?: string): Promise<Entitlements> {
  const now = Date.now();

  const { data: sub, error } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('userId', userId)
    .maybeSingle();

  if (error) {
    console.error('[SUPABASE] Error reading subscription:', error);
  }

  if (!sub) {
    let trialStart = now;
    try {
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('"createdAt"')
        .eq('id', userId)
        .maybeSingle();
      if (userData?.createdAt) {
        trialStart = Number(userData.createdAt);
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

    const { error: insertErr } = await supabaseAdmin
      .from('subscriptions')
      .upsert(newSubData);

    if (insertErr) {
      console.error('[SUPABASE] Error initializing subscription:', insertErr);
    }

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

  // Check active paid subscription
  if (sub.status === 'active' && Number(sub.expiresAt) > now) {
    const expiresAtNum = Number(sub.expiresAt);
    const remainingMs = Math.max(0, expiresAtNum - now);
    const daysRemaining = Number((remainingMs / (24 * 60 * 60 * 1000)).toFixed(1));
    return {
      userId,
      isPremium: true,
      isTrialActive: false,
      trialExpired: false,
      daysRemaining,
      plan: 'premium',
      status: 'active',
      expiresAt: expiresAtNum
    };
  }

  // Check trial period
  const trialExpiresAtNum = Number(sub.trialExpiresAt) || (Number(sub.trialStartedAt) ? Number(sub.trialStartedAt) + TRIAL_DURATION_MS : now);
  const isTrialActive = now <= trialExpiresAtNum;
  const daysRemaining = Number((Math.max(0, trialExpiresAtNum - now) / (24 * 60 * 60 * 1000)).toFixed(1));

  if (!isTrialActive && sub.status !== 'expired') {
    await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'expired', updatedAt: now })
      .eq('userId', userId);
  }

  return {
    userId,
    isPremium: false,
    isTrialActive,
    trialExpired: !isTrialActive,
    daysRemaining,
    plan: isTrialActive ? 'free_trial' : 'expired',
    status: isTrialActive ? 'trial' : 'expired',
    expiresAt: trialExpiresAtNum
  };
}

/**
 * Verifies if user has active trial or active subscription. Throws 403 if expired.
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

  // Store pending payment in authoritative Supabase payments table
  const paymentRecord = {
    reference,
    userId,
    amount: SUBSCRIPTION_AMOUNT_KOBO,
    currency: 'NGN',
    status: 'pending',
    customerEmail: email,
    createdAt: now,
    updatedAt: now
  };

  const { error } = await supabaseAdmin.from('payments').insert(paymentRecord);
  if (error) {
    console.error('[SUPABASE] Failed to create payment record:', error);
  }

  return {
    reference,
    amount: SUBSCRIPTION_AMOUNT_KOBO,
    currency: 'NGN',
    email,
    publicKey: process.env.VITE_PAYSTACK_PUBLIC_KEY || ''
  };
}

/**
 * Authoritatively verifies a Paystack payment and updates subscription state in Supabase.
 * - Enforces authentication and reference ownership
 * - Calls real Paystack verification endpoint with secret key
 * - Strictly prohibits production payment simulation
 * - Idempotent
 */
export async function verifyPayment(reference: string, authenticatedUserId: string) {
  if (!reference || typeof reference !== 'string') {
    throw new Error('Payment reference is required.');
  }

  // Look up existing payment record
  const { data: paymentRecord, error: fetchErr } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('reference', reference)
    .maybeSingle();

  if (fetchErr) {
    console.error('[SUPABASE] Payment lookup error:', fetchErr);
  }

  // 1. Verify ownership: A user must NOT be able to submit somebody else's reference
  if (paymentRecord && paymentRecord.userId && paymentRecord.userId !== authenticatedUserId) {
    throw new Error('Unauthorized: This payment reference does not belong to your account.');
  }

  // 2. Idempotency check: if already successful, return confirmation without repeating operations
  if (paymentRecord?.status === 'success') {
    return {
      status: 'success',
      message: 'Payment already verified and subscription is active.',
      reference
    };
  }

  // 3. Strict secret key requirement: NO fallback simulation in production
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey || secretKey.trim().length === 0) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured on the server. Payment verification cannot proceed.');
  }

  // 4. Call official Paystack transaction verification endpoint
  let paystackData: any = null;
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: {
        Authorization: `Bearer ${secretKey.trim()}`
      }
    });

    const json = await response.json();
    if (!json.status || !json.data) {
      throw new Error(json.message || 'Invalid response from Paystack gateway.');
    }

    paystackData = json.data;
  } catch (err: any) {
    console.error('[PAYSTACK] Verification gateway error:', err);
    throw new Error(`Paystack gateway error: ${err.message}`);
  }

  // 5. Validate status, currency, amount (>= ₦1,000 / 100,000 kobo), and reference match
  if (
    paystackData.status !== 'success' ||
    paystackData.currency !== 'NGN' ||
    Number(paystackData.amount) < SUBSCRIPTION_AMOUNT_KOBO ||
    paystackData.reference !== reference
  ) {
    throw new Error(`Payment criteria not met (Status: ${paystackData.status}, Amount: ${paystackData.amount}, Currency: ${paystackData.currency})`);
  }

  const now = Date.now();
  const expiresAt = now + MONTH_MS;

  // 6. Authoritatively update payments record
  await supabaseAdmin
    .from('payments')
    .upsert({
      reference,
      userId: authenticatedUserId,
      amount: Number(paystackData.amount) || SUBSCRIPTION_AMOUNT_KOBO,
      currency: 'NGN',
      status: 'success',
      paidAt: now,
      paystackResponse: paystackData,
      updatedAt: now
    });

  // 7. Authoritatively update subscriptions record
  await supabaseAdmin
    .from('subscriptions')
    .upsert({
      userId: authenticatedUserId,
      status: 'active',
      plan: 'premium',
      subscriptionStartedAt: now,
      expiresAt,
      amountPaid: 1000,
      lastPaymentReference: reference,
      updatedAt: now
    });

  // 8. Sync user profile flags
  try {
    await supabaseAdmin
      .from('users')
      .update({
        isPremium: true,
        isSubscribed: true,
        subscription: {
          plan: 'premium',
          expiresAt: new Date(expiresAt).toISOString()
        },
        updatedAt: now
      })
      .eq('id', authenticatedUserId);
  } catch (e) {
    console.error('[SUPABASE] Error updating user profile flags:', e);
  }

  // 9. Record in admin audit logs
  try {
    await supabaseAdmin
      .from('admin_audit_logs')
      .insert({
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
 * Handles Paystack webhooks with strict HMAC SHA-512 verification.
 */
export async function handlePaystackWebhook(rawBody: string, signature: string) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured on the server. Webhook rejected.');
  }

  if (!signature) {
    throw new Error('Missing x-paystack-signature header. Webhook rejected.');
  }

  const hash = crypto.createHmac('sha512', secretKey).update(rawBody).digest('hex');
  if (hash !== signature) {
    throw new Error('Invalid Paystack signature. Webhook rejected.');
  }

  const event = JSON.parse(rawBody);
  if (event.event === 'charge.success' && event.data) {
    const { reference, metadata } = event.data;
    if (!reference) {
      throw new Error('Missing transaction reference in Paystack webhook event.');
    }

    // Look up established payment record to authoritatively resolve user
    const { data: paymentRecord } = await supabaseAdmin
      .from('payments')
      .select('userId, status')
      .eq('reference', reference)
      .maybeSingle();

    if (paymentRecord?.status === 'success') {
      return { received: true, message: 'Already processed' };
    }

    const targetUserId = paymentRecord?.userId || metadata?.userId;
    if (!targetUserId) {
      throw new Error(`Unable to resolve user account for Paystack reference: ${reference}`);
    }

    await verifyPayment(reference, targetUserId);
  }

  return { received: true };
}
