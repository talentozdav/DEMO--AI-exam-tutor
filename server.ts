import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { verifyUserToken, adminDb, AuthUser } from './server/firebaseAdmin';
import { 
  serverAskAITutor, 
  serverGenerateQuestions, 
  serverAnalyzeEssay, 
  serverGetSmartStudyPlan 
} from './server/geminiBackend';
import { 
  getUserEntitlements, 
  checkAccessOrThrow, 
  initializePayment, 
  verifyPayment, 
  handlePaystackWebhook 
} from './server/subscriptionService';

interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(cors());
  
  // Capture raw body for Paystack webhook signature verification
  app.use(express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString();
    }
  }));

  // Authentication Middleware for API endpoints
  async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const user = await verifyUserToken(authHeader);
    if (!user) {
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
    }
    req.user = user;
    next();
  }

  // Admin Verification Middleware
  async function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const user = await verifyUserToken(authHeader);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Admin privileges required' });
    }
    req.user = user;
    next();
  }

  // ==========================================
  // API ROUTES
  // ==========================================

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'DEMO AI Exam Tutor Backend', timestamp: Date.now() });
  });

  // 1. Get User Entitlements (Authoritative trial & subscription state)
  app.get('/api/getUserEntitlements', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const entitlements = await getUserEntitlements(req.user!.uid, req.user!.email);
      res.json(entitlements);
    } catch (err: any) {
      console.error('Error in getUserEntitlements:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Initialize Payment with Paystack
  app.post('/api/initializePayment', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const email = req.body.email || req.user!.email || 'student@example.com';
      const result = await initializePayment(req.user!.uid, email);
      res.json(result);
    } catch (err: any) {
      console.error('Error in initializePayment:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Verify Payment with Paystack
  app.post('/api/verifyPayment', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { reference } = req.body;
      if (!reference) {
        return res.status(400).json({ error: 'Reference is required' });
      }
      const result = await verifyPayment(reference, req.user!.uid);
      res.json(result);
    } catch (err: any) {
      console.error('Error in verifyPayment:', err);
      res.status(400).json({ error: err.message });
    }
  });

  // 4. Paystack Webhook Handler
  app.post('/api/paystackWebhook', async (req: any, res: Response) => {
    try {
      const signature = req.headers['x-paystack-signature'] as string;
      const rawBody = req.rawBody || JSON.stringify(req.body);
      const result = await handlePaystackWebhook(rawBody, signature || '');
      res.json(result);
    } catch (err: any) {
      console.error('Error in paystackWebhook:', err);
      res.status(400).send(err.message);
    }
  });

  // 5. Ask AI Tutor (Protected by Subscription/Trial Entitlement)
  app.post('/api/askAITutor', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Check trial or subscription entitlement
      await checkAccessOrThrow(req.user!.uid, req.user!.email);

      const { message, examType, subject, chatHistory, image } = req.body;
      if (!message && !image) {
        return res.status(400).json({ error: 'Message or image required' });
      }

      const response = await serverAskAITutor(
        message || 'Explain this academic problem.',
        examType || 'WAEC',
        subject || 'Mathematics',
        chatHistory || [],
        image
      );

      // Log interaction in Firestore ai_interactions
      try {
        await adminDb.collection('ai_interactions').add({
          userId: req.user!.uid,
          type: 'tutor',
          subject: subject || 'Mathematics',
          examType: examType || 'WAEC',
          timestamp: Date.now()
        });
      } catch (e) {}

      res.json({ response });
    } catch (err: any) {
      if (err.code === 'TRIAL_EXPIRED') {
        return res.status(403).json({ 
          error: 'TRIAL_EXPIRED', 
          message: err.message 
        });
      }
      console.error('Error in askAITutor:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // 6. Generate Practice Questions
  app.post('/api/generateQuestions', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      await checkAccessOrThrow(req.user!.uid, req.user!.email);

      const { count, examType, subject, type } = req.body;
      const questions = await serverGenerateQuestions(
        Number(count) || 5,
        examType || 'JAMB',
        subject || 'Mathematics',
        type || 'OBJ'
      );

      // Log interaction
      try {
        await adminDb.collection('ai_interactions').add({
          userId: req.user!.uid,
          type: 'questions',
          subject: subject || 'Mathematics',
          examType: examType || 'JAMB',
          timestamp: Date.now()
        });
      } catch (e) {}

      res.json({ questions });
    } catch (err: any) {
      if (err.code === 'TRIAL_EXPIRED') {
        return res.status(403).json({ error: 'TRIAL_EXPIRED', message: err.message });
      }
      console.error('Error in generateQuestions:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // 7. Submit Theory/Essay for Grading
  app.post('/api/submitEssay', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      await checkAccessOrThrow(req.user!.uid, req.user!.email);

      const { question, answer, examType } = req.body;
      if (!question || !answer) {
        return res.status(400).json({ error: 'Question and answer required' });
      }

      const feedback = await serverAnalyzeEssay(question, answer, examType || 'WAEC');

      // Log interaction
      try {
        await adminDb.collection('ai_interactions').add({
          userId: req.user!.uid,
          type: 'essay',
          examType: examType || 'WAEC',
          timestamp: Date.now()
        });
      } catch (e) {}

      res.json({ feedback });
    } catch (err: any) {
      if (err.code === 'TRIAL_EXPIRED') {
        return res.status(403).json({ error: 'TRIAL_EXPIRED', message: err.message });
      }
      console.error('Error in submitEssay:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // 8. Generate Smart Study Plan
  app.post('/api/getSmartStudyPlan', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { profile } = req.body;
      const plan = await serverGetSmartStudyPlan(profile || {});
      res.json({ plan });
    } catch (err: any) {
      console.error('Error in getSmartStudyPlan:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // 8b. Authoritative Referral Reward Claim (20 active referrals = 1 year premium)
  app.post('/api/redeemReferralReward', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.uid;
      const userRef = adminDb.collection('users_public').doc(userId);
      const userSnap = await userRef.get();
      const activeCount = userSnap.data()?.activeReferralCount || 0;

      if (activeCount < 20) {
        return res.status(400).json({ error: 'INSUFFICIENT_REFERRALS', message: 'You need at least 20 active referrals.' });
      }

      const now = Date.now();
      const oneYearMs = 365 * 24 * 60 * 60 * 1000;
      const expiresAt = now + oneYearMs;

      await adminDb.collection('subscriptions').doc(userId).set({
        userId,
        status: 'active',
        plan: 'premium',
        subscriptionStartedAt: now,
        expiresAt,
        amountPaid: 0,
        lastPaymentReference: 'REFERRAL_20_FRIENDS',
        updatedAt: now
      }, { merge: true });

      await adminDb.collection('users').doc(userId).set({
        isPremium: true,
        isSubscribed: true,
        referralRewardsClaimed: true
      }, { merge: true });

      res.json({ success: true, message: 'Full WAEC/NECO unlocked for 1 year!' });
    } catch (err: any) {
      console.error('Error in redeemReferralReward:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // 9. Admin Dashboard Metrics
  app.get('/api/admin/metrics', requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const usersSnap = await adminDb.collection('users').get();
      const subsSnap = await adminDb.collection('subscriptions').where('status', '==', 'active').get();
      const paymentsSnap = await adminDb.collection('payments').where('status', '==', 'success').get();
      const aiSnap = await adminDb.collection('ai_interactions').get();

      let totalRevenue = 0;
      paymentsSnap.forEach(p => {
        totalRevenue += (p.data().amount || 0) / 100;
      });

      res.json({
        totalUsers: usersSnap.size,
        activeSubscribers: subsSnap.size,
        successfulPayments: paymentsSnap.size,
        totalRevenueNGN: totalRevenue,
        totalAIInteractions: aiSnap.size
      });
    } catch (err: any) {
      console.error('Error in admin metrics:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // 10. Admin Override Subscription
  app.post('/api/admin/overrideSubscription', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { targetUserId, action, days } = req.body;
      if (!targetUserId) return res.status(400).json({ error: 'targetUserId required' });

      const now = Date.now();
      const durationMs = (Number(days) || 30) * 24 * 60 * 60 * 1000;

      if (action === 'grant_premium') {
        const expiresAt = now + durationMs;
        await adminDb.collection('subscriptions').doc(targetUserId).set({
          userId: targetUserId,
          status: 'active',
          plan: 'premium',
          subscriptionStartedAt: now,
          expiresAt,
          amountPaid: 0,
          lastPaymentReference: 'ADMIN_OVERRIDE',
          updatedAt: now
        }, { merge: true });

        await adminDb.collection('users').doc(targetUserId).set({
          isPremium: true,
          isSubscribed: true
        }, { merge: true });

        await adminDb.collection('admin_audit_logs').add({
          adminId: req.user!.uid,
          action: 'ADMIN_GRANT_PREMIUM',
          targetUserId,
          details: { days: days || 30 },
          timestamp: now
        });

        return res.json({ success: true, message: 'Premium granted' });
      } else if (action === 'revoke_premium') {
        await adminDb.collection('subscriptions').doc(targetUserId).set({
          status: 'expired',
          plan: 'expired',
          expiresAt: now,
          updatedAt: now
        }, { merge: true });

        await adminDb.collection('users').doc(targetUserId).set({
          isPremium: false,
          isSubscribed: false
        }, { merge: true });

        await adminDb.collection('admin_audit_logs').add({
          adminId: req.user!.uid,
          action: 'ADMIN_REVOKE_PREMIUM',
          targetUserId,
          details: {},
          timestamp: now
        });

        return res.json({ success: true, message: 'Subscription revoked' });
      }

      res.status(400).json({ error: 'Invalid action' });
    } catch (err: any) {
      console.error('Error in overrideSubscription:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware in development vs static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DEMO Firebase Backend Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
