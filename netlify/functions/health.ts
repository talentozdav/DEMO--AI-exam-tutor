import type { Handler, HandlerEvent } from '@netlify/functions';
import { handleOptions, jsonResponse } from '../lib/response';

export const handler: Handler = async (event: HandlerEvent) => {
  const opt = handleOptions(event);
  if (opt) return opt;

  return jsonResponse(200, {
    status: 'ok',
    service: 'DEMO Digital Exam Mentor Netlify Backend',
    timestamp: Date.now()
  }, event.headers.origin || event.headers.Origin);
};
