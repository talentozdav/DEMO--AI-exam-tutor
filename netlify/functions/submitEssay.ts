import type { Handler, HandlerEvent } from '@netlify/functions';
import { handleOptions, jsonResponse, errorResponse } from '../lib/response';
import { verifyUserToken } from '../lib/auth';
import { checkAccessOrThrow } from '../lib/subscriptionService';
import { serverAnalyzeEssay } from '../lib/geminiBackend';
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

    await checkAccessOrThrow(user.uid, user.email);

    let body: any = {};
    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch (e) {
        return errorResponse(400, 'INVALID_BODY', 'Malformed JSON body', origin);
      }
    }

    const { question, answer, examType } = body;
    if (!question || !answer) {
      return errorResponse(400, 'BAD_REQUEST', 'Question and answer are required', origin);
    }

    const feedback = await serverAnalyzeEssay(question, answer, examType || 'WAEC');

    try {
      await supabaseAdmin.from('ai_interactions').insert({
        userId: user.uid,
        type: 'essay',
        examType: examType || 'WAEC',
        timestamp: Date.now()
      });
    } catch (e) {
      console.warn('Logging essay warning:', e);
    }

    return jsonResponse(200, { feedback }, origin);
  } catch (err: any) {
    if (err.code === 'TRIAL_EXPIRED') {
      return errorResponse(403, 'TRIAL_EXPIRED', err.message, origin);
    }
    console.error('Error in submitEssay:', err);
    return errorResponse(500, 'SERVER_ERROR', err.message || 'Error grading essay', origin);
  }
};
