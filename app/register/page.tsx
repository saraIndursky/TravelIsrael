import type { Metadata } from "next";
import { RegisterForm } from "@/components/features/auth/register-form";

export const metadata: Metadata = {
  title: "הרשמה — TravelIsrael",
  description: "יצירת חשבון חדש ב-TravelIsrael",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
