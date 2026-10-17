import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseSchema, getSupabaseUrl } from "@/lib/supabase/env";
import { applyLevelOverrides, type LevelOverrides } from "@/lib/levels";

const REVALIDATE_SECONDS = 30;

/**
 * The accessibility and difficulty names/explanations as admins last saved them. It uses a client
 * without cookies (the tables are public) and a short Next data cache, so reading it in the root
 * layout doesn't make every page dynamic. Also refreshes the server's copy of the levels.
 */
export async function loadLevelOverrides(): Promise<LevelOverrides | null> {
  try {
    const supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      db: { schema: getSupabaseSchema() },
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) =>
          fetch(input, { ...init, next: { revalidate: REVALIDATE_SECONDS, tags: ["levels"] } }),
      },
    });
    const [accessibility, difficulty] = await Promise.all([
      supabase.from("accessibility_levels").select("level, name, description"),
      supabase.from("difficulty_levels").select("code, name, description"),
    ]);
    if (accessibility.error || difficulty.error) return null;
    const overrides: LevelOverrides = {
      accessibility: (accessibility.data ?? []).map((row) => ({
        level: Number(row.level),
        name: String(row.name),
        description: String(row.description ?? ""),
      })),
      difficulty: (difficulty.data ?? []).map((row) => ({
        code: String(row.code),
        name: String(row.name),
        description: String(row.description ?? ""),
      })),
    };
    applyLevelOverrides(overrides);
    return overrides;
  } catch {
    return null;
  }
}
