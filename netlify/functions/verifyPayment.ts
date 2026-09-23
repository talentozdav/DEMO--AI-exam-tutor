import type { Handler, HandlerEvent } from '@netlify/functions';
import { handleOptions, jsonResponse, errorResponse } from '../lib/response';
import { verifyUserToken } from '../lib/auth';
import { verifyPayment } from '../lib/subscriptionService';

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

    let body: any = {};
    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch (e) {
        return errorResponse(400, 'INVALID_BODY', 'Malformed JSON body', origin);
      }
    }

    const { reference } = body;
    if (!reference || typeof reference !== 'string') {
      return errorResponse(400, 'BAD_REQUEST', 'Valid transaction reference is required', origin);
    }

    const result = await verifyPayment(reference.trim(), user.uid);
    return jsonResponse(200, result, origin);
  } catch (err: any) {
    console.error('Error in verifyPayment:', err);
    return errorResponse(400, 'VERIFICATION_FAILED', err.message || 'Payment verification failed', origin);
  }
};
