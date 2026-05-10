import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseEnv {
  url: string;
  anonKey: string;
}

export function createSupabaseClient(env: SupabaseEnv, options?: {
  storage?: any;
  detectSessionInUrl?: boolean;
}): SupabaseClient {
  return createClient(env.url, env.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: options?.detectSessionInUrl ?? false,
      storage: options?.storage,
    },
  });
}
