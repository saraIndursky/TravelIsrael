import type { UserRole } from "@/types";
import type { AppSupabaseClient } from "@/lib/supabase/client";

export function getBootstrapAdminEmail(): string | null {
  const value = process.env.NEXT_PUBLIC_BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  return value || null;
}

export async function resolveBootstrapRole(
  supabase: AppSupabaseClient,
  email: string
): Promise<UserRole> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return "user";

  const { data, error } = await supabase.rpc("resolve_bootstrap_role", {
    user_email: normalizedEmail,
  });

  if (!error && (data === "admin" || data === "user")) {
    return data;
  }

  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");

  if ((count ?? 0) === 0) return "admin";

  const bootstrapEmail = getBootstrapAdminEmail();
  if (bootstrapEmail && normalizedEmail === bootstrapEmail) return "admin";

  return "user";
}

export async function syncBootstrapAdminProfile(
  supabase: AppSupabaseClient,
  userId: string,
  email: string
): Promise<{ id: string; name: string; email: string; role: UserRole; avatar_url: string | null; created_at: string } | null> {
  const { data, error } = await supabase.rpc("sync_bootstrap_admin", {
    user_id: userId,
    user_email: email,
  });

  if (!error && data) {
    return data as {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      avatar_url: string | null;
      created_at: string;
    };
  }

  const role = await resolveBootstrapRole(supabase, email);
  const { data: updated, error: updateError } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId)
    .select("*")
    .maybeSingle();

  if (updateError || !updated) return null;
  return updated as {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar_url: string | null;
    created_at: string;
  };
}
