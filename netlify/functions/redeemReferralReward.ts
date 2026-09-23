import type { Handler, HandlerEvent } from '@netlify/functions';
import { handleOptions, jsonResponse, errorResponse } from '../lib/response';
import { verifyUserToken } from '../lib/auth';
import { supabaseAdmin } from '../lib/supabase';

export const handler: Handler = async (event: HandlerEvent) => {
  const opt = handleOptions(event);
  if (opt) return opt;

  const origin = event.headers.origin || event.headers.Origin;

  if (event.httpMethod !== 'POST') {
    return errorResponse(405, 'METHOD_NOT_ALLOWED', 'POST required', origin);
  }

  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    const user = await verifyUserToken(authHeader);

    if (!user) {
      return errorResponse(401, 'UNAUTHORIZED', 'Authentication required', origin);
    }

    const userId = user.uid;

    // 1. Authoritative verification of active referral count from Supabase
    const { count: activeReferralsCount } = await supabaseAdmin
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrerId', userId)
      .eq('status', 'active');

    const { data: userPublic } = await supabaseAdmin
      .from('users_public')
      .select('"activeReferralCount"')
      .eq('id', userId)
      .maybeSingle();

    const activeCount = Math.max(activeReferralsCount || 0, userPublic?.activeReferralCount || 0);

    if (activeCount < 20) {
      return errorResponse(
        400,
        'INSUFFICIENT_REFERRALS',
        `You currently have ${activeCount} active referrals. 20 active referrals are required to claim 1 year of free premium access.`,
        origin
      );
    }

    const now = Date.now();
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    const expiresAt = now + oneYearMs;

    // 2. Authoritatively grant 1 year premium subscription
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

    // 3. Update user profile state
    await supabaseAdmin.from('users').update({
      isPremium: true,
      isSubscribed: true,
      referralRewardsClaimed: true,
      subscription: {
        plan: 'premium',
        expiresAt: new Date(expiresAt).toISOString()
      },
      updatedAt: now
    }).eq('id', userId);

    // 4. Record audit entry
    try {
      await supabaseAdmin.from('admin_audit_logs').insert({
        adminId: 'system_referrals',
        action: 'REFERRAL_REWARD_CLAIMED',
        targetUserId: userId,
        details: { activeCount, grantedDurationMs: oneYearMs },
        timestamp: now
      });
    } catch (e) {}

    return jsonResponse(200, {
      success: true,
      message: 'Full WAEC, NECO & JAMB access unlocked for 1 year!',
      expiresAt
    }, origin);
  } catch (err: any) {
    console.error('Error in redeemReferralReward:', err);
    return errorResponse(500, 'SERVER_ERROR', err.message || 'Error processing referral reward', origin);
  }
};
