import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | undefined;

export function getSupabase(): SupabaseClient {
  return (_client ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  ));
}
