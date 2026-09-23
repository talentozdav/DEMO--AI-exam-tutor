-- ====================================================================
-- AI Exams: Migration 002 - Study Streak Tracking
-- Adds "studyStreak" jsonb column to public.users
-- ====================================================================

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS "studyStreak" JSONB DEFAULT '{"currentStreak": 1, "longestStreak": 1, "lastActiveDate": "", "activeDates": []}'::jsonb;

-- Comment on column
COMMENT ON COLUMN public.users."studyStreak" IS 'Tracks consecutive study days, personal best streak, and activity calendar';
