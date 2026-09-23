import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 
  process.env.SUPABASE_URL || 
  process.env.VITE_SUPABASE_URL || 
  'https://vviehualtgjvxvnoqppi.supabase.co';

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[CRITICAL CONFIG ERROR] SUPABASE_SERVICE_ROLE_KEY is not configured in server environment. Elevated operations will be rejected.');
}

let _adminClient: SupabaseClient | null = null;

/**
 * Returns an authoritative Supabase client initialized ONLY with SUPABASE_SERVICE_ROLE_KEY.
 * Never uses publishable or anon keys.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!_adminClient) {
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase server client error: SUPABASE_SERVICE_ROLE_KEY is missing.');
    }
    _adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return _adminClient;
}

/**
 * Safe proxy for supabaseAdmin that invokes getSupabaseAdmin() on demand.
 */
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdmin();
    const val = (client as any)[prop];
    if (typeof val === 'function') {
      return val.bind(client);
    }
    return val;
  }
});
