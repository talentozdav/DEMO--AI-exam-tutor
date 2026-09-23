import type { Handler, HandlerEvent } from '@netlify/functions';
import { handleOptions, jsonResponse, errorResponse } from '../lib/response';
import { verifyAdmin } from '../lib/auth';
import { supabaseAdmin } from '../lib/supabase';

export const handler: Handler = async (event: HandlerEvent) => {
  const opt = handleOptions(event);
  if (opt) return opt;

  const origin = event.headers.origin || event.headers.Origin;

  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    const adminUser = await verifyAdmin(authHeader);

    if (!adminUser) {
      return errorResponse(403, 'FORBIDDEN', 'Administrative privileges required', origin);
    }

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

    return jsonResponse(200, {
      totalUsers: totalUsers || 0,
      activeSubscribers: activeSubscribers || 0,
      successfulPayments: successfulPayments || 0,
      totalRevenueNGN: totalRevenue,
      totalAIInteractions: totalAIInteractions || 0
    }, origin);
  } catch (err: any) {
    console.error('Error in admin metrics:', err);
    return errorResponse(500, 'SERVER_ERROR', err.message || 'Error fetching admin metrics', origin);
  }
};
