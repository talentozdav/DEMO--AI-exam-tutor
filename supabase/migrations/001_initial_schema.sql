-- ====================================================================
-- AI Exams: Firebase to Supabase Migration - Initial Schema & RLS
-- Target: Supabase PostgreSQL (https://vviehualtgjvxvnoqppi.supabase.co)
-- ====================================================================

-- 1. USERS (Private Profile & State)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'subscriber', 'admin')),
  exams JSONB DEFAULT '["WAEC", "JAMB"]'::jsonb,
  "selectedSubjects" JSONB DEFAULT '{"WAEC": [], "NECO": [], "JAMB": []}'::jsonb,
  "examDates" JSONB DEFAULT '{"WAEC": "", "NECO": "", "JAMB": ""}'::jsonb,
  "weakSubjects" JSONB DEFAULT '[]'::jsonb,
  "isSubscribed" BOOLEAN DEFAULT FALSE,
  "trialStartedAt" BIGINT,
  "isPremium" BOOLEAN DEFAULT FALSE,
  scores JSONB DEFAULT '[]'::jsonb,
  "referralCode" TEXT UNIQUE,
  "referredBy" TEXT,
  "referralCount" INTEGER DEFAULT 0,
  "activeReferralCount" INTEGER DEFAULT 0,
  referrals JSONB DEFAULT '[]'::jsonb,
  "referralRewardsClaimed" BOOLEAN DEFAULT FALSE,
  subscription JSONB,
  "createdAt" BIGINT DEFAULT (extract(epoch from now()) * 1000)::bigint,
  "updatedAt" BIGINT DEFAULT (extract(epoch from now()) * 1000)::bigint
);

-- 2. USERS_PUBLIC (Leaderboard & Referral resolution without exposing private data)
CREATE TABLE IF NOT EXISTS public.users_public (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "referralCode" TEXT UNIQUE,
  "referralCount" INTEGER DEFAULT 0,
  "activeReferralCount" INTEGER DEFAULT 0,
  "createdAt" BIGINT DEFAULT (extract(epoch from now()) * 1000)::bigint
);

-- 3. SUBSCRIPTIONS (Authoritative trial & subscription state)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  "userId" TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'expired', 'cancelled')),
  plan TEXT NOT NULL DEFAULT 'free_trial' CHECK (plan IN ('free_trial', 'premium', 'expired')),
  "trialStartedAt" BIGINT NOT NULL,
  "trialExpiresAt" BIGINT NOT NULL,
  "subscriptionStartedAt" BIGINT DEFAULT 0,
  "expiresAt" BIGINT DEFAULT 0,
  "amountPaid" INTEGER DEFAULT 0,
  "lastPaymentReference" TEXT,
  "createdAt" BIGINT DEFAULT (extract(epoch from now()) * 1000)::bigint,
  "updatedAt" BIGINT DEFAULT (extract(epoch from now()) * 1000)::bigint
);

-- 4. PAYMENTS (Paystack transaction log)
CREATE TABLE IF NOT EXISTS public.payments (
  reference TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  "customerEmail" TEXT,
  "paidAt" BIGINT,
  "paystackResponse" JSONB,
  "createdAt" BIGINT DEFAULT (extract(epoch from now()) * 1000)::bigint,
  "updatedAt" BIGINT DEFAULT (extract(epoch from now()) * 1000)::bigint
);

-- 5. AI INTERACTIONS (Audit and usage tracking)
CREATE TABLE IF NOT EXISTS public.ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  type TEXT NOT NULL,
  subject TEXT,
  "examType" TEXT,
  timestamp BIGINT NOT NULL,
  "createdAt" BIGINT DEFAULT (extract(epoch from now()) * 1000)::bigint
);

-- 6. EXAM SESSIONS (CBT Practice & Mock scores)
CREATE TABLE IF NOT EXISTS public.exam_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "examType" TEXT NOT NULL,
  subject TEXT NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  "createdAt" BIGINT DEFAULT (extract(epoch from now()) * 1000)::bigint
);

-- 7. REFERRALS (Referral tracking and activation)
CREATE TABLE IF NOT EXISTS public.referrals (
  id TEXT PRIMARY KEY, -- ID of the referred user
  "referrerId" TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active')),
  "createdAt" BIGINT DEFAULT (extract(epoch from now()) * 1000)::bigint
);

-- 8. ADMIN AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "adminId" TEXT NOT NULL,
  action TEXT NOT NULL,
  "targetUserId" TEXT,
  details JSONB,
  timestamp BIGINT NOT NULL,
  "createdAt" BIGINT DEFAULT (extract(epoch from now()) * 1000)::bigint
);

-- ====================================================================
-- INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users("referralCode");
CREATE INDEX IF NOT EXISTS idx_users_public_referral_code ON public.users_public("referralCode");
CREATE INDEX IF NOT EXISTS idx_users_public_active_referrals ON public.users_public("activeReferralCount" DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions("userId");
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments("userId");
CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(reference);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_user_id ON public.exam_sessions("userId");
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON public.ai_interactions("userId");
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals("referrerId");
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_timestamp ON public.admin_audit_logs(timestamp DESC);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- 1. users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON public.users FOR SELECT 
  TO authenticated 
  USING (auth.uid()::text = id);

CREATE POLICY "Users can insert own profile" 
  ON public.users FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" 
  ON public.users FOR UPDATE 
  TO authenticated 
  USING (auth.uid()::text = id);

-- Trigger to prevent client-side elevation of privilege or modification of sensitive fields
CREATE OR REPLACE FUNCTION public.protect_user_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Service role bypasses field protection
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Disallow modifying critical fields from client
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Cannot modify role';
  END IF;
  IF NEW."isPremium" IS DISTINCT FROM OLD."isPremium" THEN
    RAISE EXCEPTION 'Cannot modify isPremium';
  END IF;
  IF NEW."isSubscribed" IS DISTINCT FROM OLD."isSubscribed" THEN
    RAISE EXCEPTION 'Cannot modify isSubscribed';
  END IF;
  IF NEW."referralRewardsClaimed" IS DISTINCT FROM OLD."referralRewardsClaimed" THEN
    RAISE EXCEPTION 'Cannot modify referralRewardsClaimed';
  END IF;
  IF NEW."referralCount" IS DISTINCT FROM OLD."referralCount" THEN
    RAISE EXCEPTION 'Cannot modify referralCount directly';
  END IF;
  IF NEW."activeReferralCount" IS DISTINCT FROM OLD."activeReferralCount" THEN
    RAISE EXCEPTION 'Cannot modify activeReferralCount directly';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_user_fields ON public.users;
CREATE TRIGGER trg_protect_user_fields
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.protect_user_fields();

-- 2. users_public
ALTER TABLE public.users_public ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public users are viewable by everyone" 
  ON public.users_public FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Users can insert own public profile" 
  ON public.users_public FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Users can update own public profile name" 
  ON public.users_public FOR UPDATE 
  TO authenticated 
  USING (auth.uid()::text = id);

-- 3. subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" 
  ON public.subscriptions FOR SELECT 
  TO authenticated 
  USING (auth.uid()::text = "userId");

-- Note: Only service_role can INSERT/UPDATE subscriptions (authoritative server-side management)

-- 4. payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments" 
  ON public.payments FOR SELECT 
  TO authenticated 
  USING (auth.uid()::text = "userId");

-- Note: Only service_role can INSERT/UPDATE payments (authoritative Paystack verification)

-- 5. ai_interactions
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ai interactions" 
  ON public.ai_interactions FOR SELECT 
  TO authenticated 
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own ai interactions" 
  ON public.ai_interactions FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid()::text = "userId");

-- 6. exam_sessions
ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exam sessions" 
  ON public.exam_sessions FOR SELECT 
  TO authenticated 
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own exam sessions" 
  ON public.exam_sessions FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid()::text = "userId");

-- 7. referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their referrals" 
  ON public.referrals FOR SELECT 
  TO authenticated 
  USING (auth.uid()::text = id OR auth.uid()::text = "referrerId");

CREATE POLICY "Users can register a referral" 
  ON public.referrals FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid()::text = id);

-- 8. admin_audit_logs
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
-- Note: Only service_role or server-verified admins can view and write admin audit logs

-- ====================================================================
-- REALTIME PUBLICATION
-- ====================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'users'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'subscriptions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'users_public'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users_public;
  END IF;
END $$;
