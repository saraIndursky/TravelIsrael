export function getSupabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) {
    throw new Error("חסרה משתנה סביבה: NEXT_PUBLIC_SUPABASE_URL");
  }
  return value;
}

export function getSupabaseAnonKey(): string {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!value) {
    throw new Error(
      "חסרה משתנה סביבה: NEXT_PUBLIC_SUPABASE_ANON_KEY או NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    );
  }
  return value;
}

export type SupabaseSchemaName = "public" | "demo";

/** סכמת ה-DB שאליה פונים. `demo` דורשת הוספת הסכמה ל-Exposed schemas בהגדרות הפרויקט. */
export function getSupabaseSchema(): SupabaseSchemaName {
  return process.env.NEXT_PUBLIC_SUPABASE_SCHEMA?.trim() === "demo" ? "demo" : "public";
}

/** @deprecated use getSupabaseAnonKey */
export function getSupabasePublishableKey(): string {
  return getSupabaseAnonKey();
}
