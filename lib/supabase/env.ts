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

/** The DB schema to query. `demo` requires adding the schema to Exposed schemas in the project settings. */
export function getSupabaseSchema(): SupabaseSchemaName {
  return process.env.NEXT_PUBLIC_SUPABASE_SCHEMA?.trim() === "demo" ? "demo" : "public";
}

/** @deprecated use getSupabaseAnonKey */
export function getSupabasePublishableKey(): string {
  return getSupabaseAnonKey();
}
