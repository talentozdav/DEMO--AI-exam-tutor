import type { Handler, HandlerEvent } from '@netlify/functions';
import { handleOptions, jsonResponse, errorResponse } from '../lib/response';
import { handlePaystackWebhook } from '../lib/subscriptionService';

export const handler: Handler = async (event: HandlerEvent) => {
  const opt = handleOptions(event);
  if (opt) return opt;

  const origin = event.headers.origin || event.headers.Origin;

  if (event.httpMethod !== 'POST') {
    return errorResponse(405, 'METHOD_NOT_ALLOWED', 'POST required', origin);
  }

  try {
    const signature = event.headers['x-paystack-signature'] || (event.headers as any)['X-Paystack-Signature'] || '';
    const rawBody = event.body || '';

    if (!rawBody) {
      return errorResponse(400, 'BAD_REQUEST', 'Empty request body', origin);
    }

    const result = await handlePaystackWebhook(rawBody, signature);
    return jsonResponse(200, result, origin);
  } catch (err: any) {
    console.error('Error in paystackWebhook:', err.message);
    return errorResponse(400, 'WEBHOOK_REJECTED', err.message || 'Webhook verification failed', origin);
  }
};
