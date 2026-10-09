import "server-only";

export function getResendApiKey(): string | null {
  const value = process.env.RESEND_API_KEY?.trim();
  return value || null;
}

export function getResendFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL?.trim() || "TravelIsrael <onboarding@resend.dev>";
}

export function isEmailConfigured(): boolean {
  return Boolean(getResendApiKey());
}

export function getAppBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
}
