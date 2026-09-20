import * as functions from 'firebase-functions';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { GoogleGenAI, Type } from '@google/genai';
import crypto from 'crypto';

if (!getApps().length) {
  initializeApp();
}
const db = getFirestore();

const SUBSCRIPTION_AMOUNT_KOBO = 100000; // ₦1,000 in kobo
const TRIAL_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 days in ms
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

// Helper: Authoritative entitlement check
async function assertActiveEntitlement(userId: string) {
  const subSnap = await db.collection('subscriptions').doc(userId).get();
  const now = Date.now();
  if (subSnap.exists) {
    const sub = subSnap.data()!;
    if (sub.status === 'active' && sub.expiresAt && sub.expiresAt > now) {
      return sub;
    }
    const trialExpiresAt = sub.trialExpiresAt || (sub.trialStartedAt + TRIAL_DURATION_MS);
    if (now <= trialExpiresAt) {
      return sub;
    }
  }
  throw new functions.https.HttpsError(
    'permission-denied',
    'Your 3-day free trial has expired. Upgrade for ₦1,000/month to continue learning.'
  );
}

// 1. Get User Entitlements
export const getUserEntitlements = functions.https.onCall(async (_data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }
  const userId = context.auth.uid;
  const now = Date.now();
  const subRef = db.collection('subscriptions').doc(userId);
  const subSnap = await subRef.get();

  if (!subSnap.exists) {
    const trialExpiresAt = now + TRIAL_DURATION_MS;
    const newSub = {
      userId,
      status: 'trial',
      plan: 'free_trial',
      trialStartedAt: now,
      trialExpiresAt,
      subscriptionStartedAt: 0,
      expiresAt: trialExpiresAt,
      amountPaid: 0,
      updatedAt: now
    };
    await subRef.set(newSub);
    return {
      userId,
      isPremium: false,
      isTrialActive: true,
      trialExpired: false,
      daysRemaining: 3,
      plan: 'free_trial',
      status: 'trial',
      expiresAt: trialExpiresAt
    };
  }

  const sub = subSnap.data()!;
  if (sub.status === 'active' && sub.expiresAt > now) {
    return {
      userId,
      isPremium: true,
      isTrialActive: false,
      trialExpired: false,
      daysRemaining: Number(((sub.expiresAt - now) / (24 * 60 * 60 * 1000)).toFixed(1)),
      plan: 'premium',
      status: 'active',
      expiresAt: sub.expiresAt
    };
  }

  const trialExpiresAt = sub.trialExpiresAt || (sub.trialStartedAt + TRIAL_DURATION_MS);
  const isTrialActive = now <= trialExpiresAt;
  return {
    userId,
    isPremium: false,
    isTrialActive,
    trialExpired: !isTrialActive,
    daysRemaining: Number((Math.max(0, trialExpiresAt - now) / (24 * 60 * 60 * 1000)).toFixed(1)),
    plan: isTrialActive ? 'free_trial' : 'expired',
    status: isTrialActive ? 'trial' : 'expired',
    expiresAt: trialExpiresAt
  };
});

// 2. Initialize Payment with Paystack
export const initializePayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }
  const userId = context.auth.uid;
  const email = data.email || context.auth.token.email || 'student@example.com';
  const now = Date.now();
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  const reference = `DEMO_${userId.substring(0, 5)}_${now}_${rand}`;

  await db.collection('payments').doc(reference).set({
    userId,
    reference,
    amount: SUBSCRIPTION_AMOUNT_KOBO,
    currency: 'NGN',
    status: 'pending',
    customerEmail: email,
    createdAt: now
  });

  return {
    reference,
    amount: SUBSCRIPTION_AMOUNT_KOBO,
    currency: 'NGN',
    email
  };
});

// 3. Verify Payment
export const verifyPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }
  const userId = context.auth.uid;
  const { reference } = data;
  if (!reference) {
    throw new functions.https.HttpsError('invalid-argument', 'Transaction reference is required.');
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  let verified = false;
  let paystackData: any = null;

  if (secretKey) {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secretKey}` }
    });
    const json = await response.json();
    if (json.status && json.data && json.data.status === 'success' && json.data.amount >= SUBSCRIPTION_AMOUNT_KOBO) {
      verified = true;
      paystackData = json.data;
    }
  } else if (reference.startsWith('DEMO_')) {
    verified = true;
    paystackData = { status: 'success', simulated: true };
  }

  if (!verified) {
    throw new functions.https.HttpsError('failed-precondition', 'Payment verification failed.');
  }

  const now = Date.now();
  const expiresAt = now + MONTH_MS;

  await db.collection('payments').doc(reference).set({
    userId,
    reference,
    amount: SUBSCRIPTION_AMOUNT_KOBO,
    currency: 'NGN',
    status: 'success',
    paidAt: now,
    paystackResponse: paystackData,
    updatedAt: now
  }, { merge: true });

  await db.collection('subscriptions').doc(userId).set({
    userId,
    status: 'active',
    plan: 'premium',
    subscriptionStartedAt: now,
    expiresAt,
    amountPaid: 1000,
    lastPaymentReference: reference,
    updatedAt: now
  }, { merge: true });

  await db.collection('users').doc(userId).set({
    isPremium: true,
    isSubscribed: true
  }, { merge: true });

  return { status: 'success', message: 'Subscription activated', expiresAt };
});

// 4. Paystack Webhook
export const paystackWebhook = functions.https.onRequest(async (req, res) => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const signature = req.headers['x-paystack-signature'] as string;
  if (secretKey && signature) {
    const hash = crypto.createHmac('sha512', secretKey).update((req as any).rawBody).digest('hex');
    if (hash !== signature) {
      res.status(400).send('Invalid signature');
      return;
    }
  }

  const event = req.body;
  if (event.event === 'charge.success' && event.data) {
    const reference = event.data.reference;
    const userId = event.data.metadata?.userId || (reference.includes('_') ? reference.split('_')[1] : null);
    if (userId) {
      const now = Date.now();
      const expiresAt = now + MONTH_MS;
      await db.collection('payments').doc(reference).set({
        userId,
        reference,
        amount: event.data.amount,
        currency: 'NGN',
        status: 'success',
        paidAt: now,
        paystackResponse: event.data,
        updatedAt: now
      }, { merge: true });

      await db.collection('subscriptions').doc(userId).set({
        userId,
        status: 'active',
        plan: 'premium',
        expiresAt,
        amountPaid: 1000,
        lastPaymentReference: reference,
        updatedAt: now
      }, { merge: true });
    }
  }

  res.status(200).send({ received: true });
});

// 5. Ask AI Tutor Cloud Function
export const askAITutor = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }
  await assertActiveEntitlement(context.auth.uid);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  const { message, examType, subject, chatHistory, image } = data;

  const parts: any[] = [];
  if (image) {
    parts.push({ inlineData: { data: image.data, mimeType: image.mimeType } });
  }
  parts.push({ text: message });

  const contents = [
    ...(chatHistory || []).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    })),
    { role: 'user', parts }
  ];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: contents as any,
    config: {
      systemInstruction: `You are DEMO – Digital Exam Mentor for Nigerian exams (${examType} ${subject}). Provide supportive, syllabus-accurate answers.`,
      temperature: 0.7
    }
  });

  await db.collection('ai_interactions').add({
    userId: context.auth.uid,
    type: 'tutor',
    subject: subject || 'Mathematics',
    examType: examType || 'WAEC',
    timestamp: Date.now()
  });

  return { response: response.text || '' };
});

// 6. Generate Practice Questions
export const generateQuestions = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }
  await assertActiveEntitlement(context.auth.uid);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  const { count, examType, subject, type } = data;

  const prompt = `Generate ${count || 5} original ${examType || 'JAMB'} ${type || 'OBJ'} questions for ${subject || 'Mathematics'}.`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                subjectId: { type: Type.STRING },
                examType: { type: Type.STRING },
                year: { type: Type.NUMBER },
                text: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING },
                type: { type: Type.STRING }
              },
              required: ["id", "subjectId", "examType", "year", "text", "correctAnswer", "explanation", "type"]
            }
          }
        }
      }
    }
  });

  const parsed = JSON.parse(response.text || '{"questions": []}');
  return { questions: parsed.questions || [] };
});

// 7. Submit Theory / Essay for Grading
export const submitEssay = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }
  await assertActiveEntitlement(context.auth.uid);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  const { question, answer, examType } = data;

  const prompt = `Analyze this student's response for a ${examType} question: "${question}".\nStudent Answer: "${answer}"`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weakAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          modelAnswer: { type: Type.STRING }
        },
        required: ["score", "feedback", "strengths", "weakAreas", "suggestions", "modelAnswer"]
      }
    }
  });

  const feedback = JSON.parse(response.text || '{}');
  return { feedback };
});
