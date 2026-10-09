import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { User, UserRole } from "@/types";

function isUserRole(value: unknown): value is UserRole {
  return value === "guest" || value === "user" || value === "admin";
}

export function mapSupabaseUser(user: SupabaseUser): User {
  const metadata = user.user_metadata as Record<string, unknown>;
  const appMetadata = user.app_metadata as Record<string, unknown>;

  const fullName =
    (typeof metadata.full_name === "string" && metadata.full_name) ||
    (typeof metadata.name === "string" && metadata.name) ||
    user.email?.split("@")[0] ||
    "משתמש";

  const roleFromApp = appMetadata.role;
  const role: UserRole = isUserRole(roleFromApp) ? roleFromApp : "user";

  const avatarUrl =
    (typeof metadata.avatar_url === "string" && metadata.avatar_url) ||
    (typeof metadata.picture === "string" && metadata.picture) ||
    undefined;

  return {
    id: user.id,
    name: fullName,
    email: user.email ?? "",
    role,
    avatar_url: avatarUrl,
    created_at: user.created_at,
  };
}
