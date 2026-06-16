import type { Metadata } from "next";
import { LoginForm } from "@/components/features/auth/login-form";

export const metadata: Metadata = {
  title: "התחברות — TravelIsrael",
  description: "התחברות לחשבון TravelIsrael",
};

export default function LoginPage() {
  return <LoginForm />;
}
