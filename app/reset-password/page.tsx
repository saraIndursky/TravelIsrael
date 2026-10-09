import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/features/auth/reset-password-form";

export const metadata: Metadata = {
  title: "סיסמה חדשה — TravelIsrael",
  description: "הגדרת סיסמה חדשה אחרי איפוס",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
