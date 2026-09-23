import type { Handler, HandlerEvent } from '@netlify/functions';
import { handleOptions, jsonResponse, errorResponse } from '../lib/response';
import { verifyUserToken } from '../lib/auth';
import { getUserEntitlements } from '../lib/subscriptionService';

export const handler: Handler = async (event: HandlerEvent) => {
  const opt = handleOptions(event);
  if (opt) return opt;

  const origin = event.headers.origin || event.headers.Origin;

  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    const user = await verifyUserToken(authHeader);

    if (!user) {
      return errorResponse(401, 'UNAUTHORIZED', 'Authentication required', origin);
    }

    const entitlements = await getUserEntitlements(user.uid, user.email);
    return jsonResponse(200, entitlements, origin);
  } catch (err: any) {
    console.error('Error in getUserEntitlements:', err);
    return errorResponse(500, 'SERVER_ERROR', err.message || 'Internal server error', origin);
  }
};
