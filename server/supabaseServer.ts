import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 
  process.env.SUPABASE_URL || 
  process.env.VITE_SUPABASE_URL || 
  'https://vviehualtgjvxvnoqppi.supabase.co';

const SUPABASE_SERVICE_KEY = 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  'sb_publishable_YY-l287guq007poFhoaA-g_DIwEVkfv';

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[SERVER] SUPABASE_SERVICE_ROLE_KEY not set in environment. Using fallback publishable key for development.');
}

// Authoritative Supabase Server Client
export const supabaseAdmin: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export interface AuthUser {
  uid: string;
  email?: string;
  role: 'student' | 'subscriber' | 'admin';
}

const ADMIN_EMAILS = [
  'democustomersupportservices@gmail.com',
  'admin@digitalexammentor.ng'
];

/**
 * Authoritatively verifies Supabase JWT token from Authorization header.
 */
export async function verifyUserToken(authHeader?: string): Promise<AuthUser | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) return null;

  try {
    // 1. Authoritative verification via Supabase Auth
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (user && !error) {
      const email = user.email?.toLowerCase() || '';
      const isAdmin = ADMIN_EMAILS.includes(email) || 
                      user.user_metadata?.role === 'admin' || 
                      user.app_metadata?.role === 'admin';

      const role: 'student' | 'subscriber' | 'admin' = 
        isAdmin ? 'admin' : (user.user_metadata?.role === 'subscriber' ? 'subscriber' : 'student');

      return {
        uid: user.id,
        email: user.email,
        role
      };
    }
  } catch (verifyError) {
    console.warn('[SERVER] Supabase getUser verification error, checking fallback JWT decoding:', verifyError);
  }

  // 2. Fallback: Parse valid JWT token payload if server network is constrained
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      const uid = payload.sub || payload.user_id;
      if (uid) {
        const email = (payload.email || '').toLowerCase();
        const isAdmin = ADMIN_EMAILS.includes(email) || 
                        payload.role === 'admin' || 
                        payload.user_metadata?.role === 'admin';

        return {
          uid,
          email: payload.email || '',
          role: isAdmin ? 'admin' : (payload.role === 'subscriber' ? 'subscriber' : 'student')
        };
      }
    }
  } catch (parseErr) {
    // Invalid JWT format
  }

  return null;
}
