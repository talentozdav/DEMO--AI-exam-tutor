import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { verifyUserToken, supabaseAdmin, AuthUser } from './server/supabaseServer';
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
    res.json({ 
      status: 'ok', 
      service: 'DEMO AI Exam Tutor Supabase Backend', 
      timestamp: Date.now() 
    });
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

      // Log interaction in Supabase ai_interactions table
      try {
        await supabaseAdmin.from('ai_interactions').insert({
          userId: req.user!.uid,
          type: 'tutor',
          subject: subject || 'Mathematics',
          examType: examType || 'WAEC',
          timestamp: Date.now()
        });
      } catch (e) {
        console.warn('Logging AI interaction warning:', e);
      }

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

      // Log interaction in Supabase
      try {
        await supabaseAdmin.from('ai_interactions').insert({
          userId: req.user!.uid,
          type: 'questions',
          subject: subject || 'Mathematics',
          examType: examType || 'JAMB',
          timestamp: Date.now()
        });
      } catch (e) {
        console.warn('Logging questions warning:', e);
      }

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

      // Log interaction in Supabase
      try {
        await supabaseAdmin.from('ai_interactions').insert({
          userId: req.user!.uid,
          type: 'essay',
          examType: examType || 'WAEC',
          timestamp: Date.now()
        });
      } catch (e) {
        console.warn('Logging essay warning:', e);
      }

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
      const { data: userPublic } = await supabaseAdmin
        .from('users_public')
        .select('"activeReferralCount"')
        .eq('id', userId)
        .maybeSingle();

      const activeCount = userPublic?.activeReferralCount || 0;

      if (activeCount < 20) {
        return res.status(400).json({ 
          error: 'INSUFFICIENT_REFERRALS', 
          message: 'You need at least 20 active referrals.' 
        });
      }

      const now = Date.now();
      const oneYearMs = 365 * 24 * 60 * 60 * 1000;
      const expiresAt = now + oneYearMs;

      await supabaseAdmin.from('subscriptions').upsert({
        userId,
        status: 'active',
        plan: 'premium',
        subscriptionStartedAt: now,
        expiresAt,
        amountPaid: 0,
        lastPaymentReference: 'REFERRAL_20_FRIENDS',
        updatedAt: now
      });

      await supabaseAdmin.from('users').update({
        isPremium: true,
        isSubscribed: true,
        referralRewardsClaimed: true,
        updatedAt: now
      }).eq('id', userId);

      res.json({ success: true, message: 'Full WAEC/NECO unlocked for 1 year!' });
    } catch (err: any) {
      console.error('Error in redeemReferralReward:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // 9. Admin Dashboard Metrics
  app.get('/api/admin/metrics', requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const { count: totalUsers } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { count: activeSubscribers } = await supabaseAdmin
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { data: paymentsData, count: successfulPayments } = await supabaseAdmin
        .from('payments')
        .select('amount', { count: 'exact' })
        .eq('status', 'success');

      const { count: totalAIInteractions } = await supabaseAdmin
        .from('ai_interactions')
        .select('*', { count: 'exact', head: true });

      let totalRevenue = 0;
      if (paymentsData) {
        paymentsData.forEach(p => {
          totalRevenue += (Number(p.amount) || 0) / 100;
        });
      }

      res.json({
        totalUsers: totalUsers || 0,
        activeSubscribers: activeSubscribers || 0,
        successfulPayments: successfulPayments || 0,
        totalRevenueNGN: totalRevenue,
        totalAIInteractions: totalAIInteractions || 0
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
        await supabaseAdmin.from('subscriptions').upsert({
          userId: targetUserId,
          status: 'active',
          plan: 'premium',
          subscriptionStartedAt: now,
          expiresAt,
          amountPaid: 0,
          lastPaymentReference: 'ADMIN_OVERRIDE',
          updatedAt: now
        });

        await supabaseAdmin.from('users').update({
          isPremium: true,
          isSubscribed: true,
          updatedAt: now
        }).eq('id', targetUserId);

        await supabaseAdmin.from('admin_audit_logs').insert({
          adminId: req.user!.uid,
          action: 'ADMIN_GRANT_PREMIUM',
          targetUserId,
          details: { days: days || 30 },
          timestamp: now
        });

        return res.json({ success: true, message: 'Premium granted' });
      } else if (action === 'revoke_premium') {
        await supabaseAdmin.from('subscriptions').upsert({
          userId: targetUserId,
          status: 'expired',
          plan: 'expired',
          expiresAt: now,
          updatedAt: now
        });

        await supabaseAdmin.from('users').update({
          isPremium: false,
          isSubscribed: false,
          updatedAt: now
        }).eq('id', targetUserId);

        await supabaseAdmin.from('admin_audit_logs').insert({
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
    console.log(`DEMO Supabase Backend Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
