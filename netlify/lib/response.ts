import type { HandlerResponse, HandlerEvent } from '@netlify/functions';

export const ALLOWED_ORIGINS = [
  'https://demoexams.com.ng',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8888'
];

export function getCorsHeaders(origin?: string): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : 'https://demoexams.com.ng';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-paystack-signature',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };
}

export function handleOptions(event: HandlerEvent): HandlerResponse | null {
  if (event.httpMethod === 'OPTIONS') {
    const origin = event.headers.origin || event.headers.Origin;
    return {
      statusCode: 204,
      headers: getCorsHeaders(origin),
      body: ''
    };
  }
  return null;
}

export function jsonResponse(
  statusCode: number,
  body: any,
  origin?: string,
  extraHeaders?: Record<string, string>
): HandlerResponse {
  return {
    statusCode,
    headers: {
      ...getCorsHeaders(origin),
      ...extraHeaders
    },
    body: typeof body === 'string' ? body : JSON.stringify(body)
  };
}

export function errorResponse(
  statusCode: number,
  error: string,
  message?: string,
  origin?: string
): HandlerResponse {
  return jsonResponse(statusCode, { error, message: message || error }, origin);
}
