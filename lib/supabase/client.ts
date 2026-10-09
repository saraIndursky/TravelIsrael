import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseSchema, getSupabaseUrl } from "@/lib/supabase/env";

export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    db: { schema: getSupabaseSchema() },
  });
}

export type AppSupabaseClient = ReturnType<typeof createClient>;
