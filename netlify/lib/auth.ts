import { getSupabaseAdmin } from './supabase';

export interface AuthUser {
  uid: string;
  email?: string;
  role: 'student' | 'subscriber' | 'admin';
}

const DEFAULT_ADMIN_EMAILS = [
  'democustomersupportservices@gmail.com',
  'admin@demoexams.com.ng',
  'talentozdavies@gmail.com'
];

const envAdminEmails = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

const AUTHORIZED_ADMIN_EMAILS = Array.from(new Set([...DEFAULT_ADMIN_EMAILS, ...envAdminEmails]));

/**
 * Authoritatively verifies Supabase JWT token from the Authorization header.
 * Strictly uses supabase.auth.getUser(token).
 * Insecure payload decoding fallbacks are strictly prohibited.
 */
export async function verifyUserToken(authHeader?: string | null): Promise<AuthUser | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7).trim();
  if (!token) return null;

  try {
    const supabase = getSupabaseAdmin();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.warn('[AUTH] Authoritative Supabase token verification rejected:', error?.message);
      return null;
    }

    const email = (user.email || '').toLowerCase();
    const isAdmin = AUTHORIZED_ADMIN_EMAILS.includes(email) ||
                    user.user_metadata?.role === 'admin' ||
                    user.app_metadata?.role === 'admin';

    const role: 'student' | 'subscriber' | 'admin' = 
      isAdmin ? 'admin' : (user.user_metadata?.role === 'subscriber' ? 'subscriber' : 'student');

    return {
      uid: user.id,
      email: user.email,
      role
    };
  } catch (err: any) {
    console.error('[AUTH] Authoritative token verification error:', err.message);
    return null;
  }
}

/**
 * Verifies that the request originates from an authorized administrator.
 */
export async function verifyAdmin(authHeader?: string | null): Promise<AuthUser | null> {
  const user = await verifyUserToken(authHeader);
  if (!user || user.role !== 'admin') {
    return null;
  }
  return user;
}
