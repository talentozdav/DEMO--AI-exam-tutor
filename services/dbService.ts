import { supabase } from '../lib/supabaseClient';
import { UserProfile, StudyStreak } from '../types';
import { getLocalDateString } from '../utils/streakUtils';

/**
 * Fetches user profile from Supabase 'users' table.
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user profile from Supabase:', error);
    return null;
  }

  if (data) {
    // Check localStorage fallback for studyStreak
    try {
      const cached = localStorage.getItem(`demo_streak_${userId}`);
      if (cached) {
        const parsedStreak: StudyStreak = JSON.parse(cached);
        if (!data.studyStreak || (parsedStreak.lastActiveDate >= (data.studyStreak?.lastActiveDate || ''))) {
          data.studyStreak = parsedStreak;
        }
      }
    } catch (e) {}
  }

  return data as UserProfile | null;
}

/**
 * Saves or initialises user profile during onboarding.
 * Handles both 'users' (private) and 'users_public' (leaderboard/referrals).
 */
export async function saveInitialProfile(
  userId: string,
  userEmail: string,
  profileData: Partial<UserProfile>,
  pendingRefCode?: string | null
): Promise<UserProfile> {
  const now = Date.now();
  const today = getLocalDateString();
  const referralCode = 'DEMO' + Math.random().toString(36).substring(2, 6).toUpperCase();

  const initialStreak: StudyStreak = {
    currentStreak: 1,
    longestStreak: 1,
    lastActiveDate: today,
    activeDates: [today],
  };

  try {
    localStorage.setItem(`demo_streak_${userId}`, JSON.stringify(initialStreak));
  } catch (e) {}

  const currentUser = (await supabase.auth.getUser()).data.user;
  const resolvedName = 
    profileData.name?.trim() || 
    currentUser?.user_metadata?.full_name || 
    currentUser?.user_metadata?.name || 
    'Student';

  const userProfile: UserProfile = {
    name: resolvedName,
    email: userEmail || profileData.email || currentUser?.email || '',
    exams: profileData.exams || ['WAEC', 'JAMB'],
    selectedSubjects: profileData.selectedSubjects || { WAEC: [], NECO: [], JAMB: [] },
    examDates: profileData.examDates || { WAEC: '', NECO: '', JAMB: '' },
    weakSubjects: profileData.weakSubjects || [],
    isSubscribed: false,
    trialStartedAt: now,
    isPremium: false,
    scores: [],
    studyStreak: initialStreak,
    referralCode,
    referredBy: pendingRefCode || undefined,
    referralCount: 0,
    activeReferralCount: 0,
    referrals: [],
    referralRewardsClaimed: false,
    createdAt: now
  };

  // 1. Insert to private 'users' table
  const { error: userError } = await supabase
    .from('users')
    .upsert({
      id: userId,
      ...userProfile,
      updatedAt: now
    });

  if (userError) {
    console.error('Error saving user profile to Supabase:', userError);
  }

  // 2. Insert to 'users_public' table for leaderboard & referrals
  const { error: publicError } = await supabase
    .from('users_public')
    .upsert({
      id: userId,
      name: userProfile.name,
      referralCode,
      referralCount: 0,
      activeReferralCount: 0,
      createdAt: now
    });

  if (publicError) {
    console.error('Error saving public profile to Supabase:', publicError);
  }

  // 3. Process referral if referred by another student
  if (pendingRefCode) {
    try {
      // Look up referrer in users_public
      const { data: referrer } = await supabase
        .from('users_public')
        .select('id, referralCount')
        .eq('referralCode', pendingRefCode.trim().toUpperCase())
        .maybeSingle();

      if (referrer && referrer.id !== userId) {
        // Record pending referral
        await supabase
          .from('referrals')
          .insert({
            id: userId,
            referrerId: referrer.id,
            status: 'pending',
            createdAt: now
          });

        // Increment referrer count
        const newCount = (referrer.referralCount || 0) + 1;
        await supabase
          .from('users_public')
          .update({ referralCount: newCount })
          .eq('id', referrer.id);

        const { data: refUser } = await supabase
          .from('users')
          .select('referralCount')
          .eq('id', referrer.id)
          .maybeSingle();

        if (refUser) {
          await supabase
            .from('users')
            .update({ referralCount: (refUser.referralCount || 0) + 1 })
            .eq('id', referrer.id);
        }
      }
    } catch (refErr) {
      console.warn('Error processing referral registration:', refErr);
    }
  }

  return userProfile;
}

/**
 * Updates safe profile fields in Supabase.
 */
export async function updateUserProfile(
  userId: string,
  updatedProfile: UserProfile
): Promise<void> {
  const now = Date.now();

  // Cache streak locally for instant responsiveness
  if (updatedProfile.studyStreak) {
    try {
      localStorage.setItem(`demo_streak_${userId}`, JSON.stringify(updatedProfile.studyStreak));
    } catch (e) {}
  }

  // Strip read-only/sensitive fields so trigger won't reject update
  const {
    isPremium,
    isSubscribed,
    subscription,
    trialStartedAt,
    role,
    referralRewardsClaimed,
    referralCount,
    activeReferralCount,
    ...safeFields
  } = updatedProfile as any;

  let { error } = await supabase
    .from('users')
    .update({
      ...safeFields,
      updatedAt: now
    })
    .eq('id', userId);

  // If column doesn't exist yet in Supabase schema, retry safely without studyStreak
  if (error && error.message && error.message.includes('studyStreak')) {
    const { studyStreak, ...remainingFields } = safeFields;
    const retryResult = await supabase
      .from('users')
      .update({
        ...remainingFields,
        updatedAt: now
      })
      .eq('id', userId);
    if (retryResult.error) {
      console.error('Error updating user profile in Supabase:', retryResult.error);
    }
  } else if (error) {
    console.error('Error updating user profile in Supabase:', error);
  }

  // Check if student completed their first score and activate referral
  if (updatedProfile.scores && updatedProfile.scores.length > 0) {
    try {
      const { data: pendingRef } = await supabase
        .from('referrals')
        .select('*')
        .eq('id', userId)
        .eq('status', 'pending')
        .maybeSingle();

      if (pendingRef) {
        // Mark referral as active
        await supabase
          .from('referrals')
          .update({ status: 'active' })
          .eq('id', userId);

        // Increment referrer active count
        const { data: refPublic } = await supabase
          .from('users_public')
          .select('activeReferralCount')
          .eq('id', pendingRef.referrerId)
          .maybeSingle();

        if (refPublic) {
          const newActive = (refPublic.activeReferralCount || 0) + 1;
          await supabase
            .from('users_public')
            .update({ activeReferralCount: newActive })
            .eq('id', pendingRef.referrerId);

          const { data: refPrivate } = await supabase
            .from('users')
            .select('activeReferralCount')
            .eq('id', pendingRef.referrerId)
            .maybeSingle();

          if (refPrivate) {
            await supabase
              .from('users')
              .update({ activeReferralCount: (refPrivate.activeReferralCount || 0) + 1 })
              .eq('id', pendingRef.referrerId);
          }
        }
      }
    } catch (refActiveErr) {
      console.warn('Error activating referral:', refActiveErr);
    }
  }
}

/**
 * Fetches top active referrers for the leaderboard.
 */
export async function fetchLeaderboard(limit = 10) {
  const { data, error } = await supabase
    .from('users_public')
    .select('id, name, referralCode, referralCount, activeReferralCount')
    .order('activeReferralCount', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  return data || [];
}

/**
 * Subscribes to real-time changes on the user's profile in Supabase.
 */
export function subscribeToUserProfile(
  userId: string,
  onUpdate: (profile: UserProfile) => void
) {
  const channel = supabase
    .channel(`public:users:id=eq.${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${userId}`
      },
      (payload) => {
        if (payload.new) {
          onUpdate(payload.new as UserProfile);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
