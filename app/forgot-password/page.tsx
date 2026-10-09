import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/features/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "איפוס סיסמה — TravelIsrael",
  description: "בקשת קישור לאיפוס סיסמה",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
