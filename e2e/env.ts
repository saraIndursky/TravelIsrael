export const hasSupabase =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  !(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").includes("example.supabase.co");

export const hasE2eUser =
  Boolean(process.env.E2E_USER_EMAIL?.trim()) &&
  Boolean(process.env.E2E_USER_PASSWORD?.trim());

export const hasE2eAdmin =
  Boolean(process.env.E2E_ADMIN_EMAIL?.trim()) &&
  Boolean(process.env.E2E_ADMIN_PASSWORD?.trim());

export function e2eUserCredentials(): { email: string; password: string } {
  return {
    email: process.env.E2E_USER_EMAIL?.trim() ?? "",
    password: process.env.E2E_USER_PASSWORD?.trim() ?? "",
  };
}

export function e2eAdminCredentials(): { email: string; password: string } {
  if (hasE2eAdmin) {
    return {
      email: process.env.E2E_ADMIN_EMAIL?.trim() ?? "",
      password: process.env.E2E_ADMIN_PASSWORD?.trim() ?? "",
    };
  }
  return e2eUserCredentials();
}

export function hasSeparateE2eAdmin(): boolean {
  if (!hasE2eAdmin) return false;
  return e2eAdminCredentials().email.toLowerCase() !== e2eUserCredentials().email.toLowerCase();
}
