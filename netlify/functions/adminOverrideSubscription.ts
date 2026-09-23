import type { Handler, HandlerEvent } from '@netlify/functions';
import { handleOptions, jsonResponse, errorResponse } from '../lib/response';
import { verifyAdmin } from '../lib/auth';
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
    const adminUser = await verifyAdmin(authHeader);

    if (!adminUser) {
      return errorResponse(403, 'FORBIDDEN', 'Administrative privileges required', origin);
    }

    let body: any = {};
    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch (e) {
        return errorResponse(400, 'INVALID_BODY', 'Malformed JSON body', origin);
      }
    }

    const { targetUserId, action, days } = body;
    if (!targetUserId) {
      return errorResponse(400, 'BAD_REQUEST', 'targetUserId is required', origin);
    }

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
        subscription: {
          plan: 'premium',
          expiresAt: new Date(expiresAt).toISOString()
        },
        updatedAt: now
      }).eq('id', targetUserId);

      await supabaseAdmin.from('admin_audit_logs').insert({
        adminId: adminUser.uid,
        action: 'ADMIN_GRANT_PREMIUM',
        targetUserId,
        details: { days: days || 30, expiresAt },
        timestamp: now
      });

      return jsonResponse(200, { success: true, message: 'Premium successfully granted' }, origin);
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
        subscription: {
          plan: 'expired',
          expiresAt: new Date(now).toISOString()
        },
        updatedAt: now
      }).eq('id', targetUserId);

      await supabaseAdmin.from('admin_audit_logs').insert({
        adminId: adminUser.uid,
        action: 'ADMIN_REVOKE_PREMIUM',
        targetUserId,
        details: {},
        timestamp: now
      });

      return jsonResponse(200, { success: true, message: 'Subscription successfully revoked' }, origin);
    }

    return errorResponse(400, 'BAD_REQUEST', 'Invalid action. Use grant_premium or revoke_premium', origin);
  } catch (err: any) {
    console.error('Error in adminOverrideSubscription:', err);
    return errorResponse(500, 'SERVER_ERROR', err.message || 'Error executing admin action', origin);
  }
};
