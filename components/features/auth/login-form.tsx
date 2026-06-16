"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail } from "lucide-react";
import {
  AuthField,
  AuthPageShell,
  authInputClassName,
  authSubmitClassName,
} from "@/components/features/auth/auth-page-shell";
import { toast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/hooks/use-stores";
import { loginDemo } from "@/lib/data/auth";
import { loginSchema, type LoginFormValues } from "@/lib/validations";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  async function onSubmit(values: LoginFormValues) {
    setSubmitting(true);
    try {
      const user = await loginDemo({
        email: values.email,
        password: values.password,
      });
      login(user.id, user.role);
      toast({ title: "התחברת בהצלחה" });
      router.push(user.role === "admin" ? "/admin" : "/");
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "שגיאה בהתחברות",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthPageShell
      title="ברוכים השבים"
      subtitle="המשיכו לתכנן את הטיול הבא שלכם"
      backgroundImage="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop"
      footer={
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            אין לך חשבון?{" "}
            <Link href="/register" className="font-medium text-gray-900 hover:underline">
              להרשמה
            </Link>
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AuthField label="אימייל" error={errors.email?.message} icon={<Mail className="h-4 w-4" />}>
          <input
            type="email"
            autoComplete="email"
            placeholder="your@email.com"
            className={authInputClassName}
            {...register("email")}
          />
        </AuthField>

        <AuthField label="סיסמה" error={errors.password?.message} icon={<Lock className="h-4 w-4" />}>
          <input
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className={authInputClassName}
            {...register("password")}
          />
        </AuthField>

        <div className="flex items-center justify-between text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-gray-600">
            <input type="checkbox" className="h-4 w-4 rounded-sm border-gray-300" {...register("rememberMe")} />
            זכור אותי
          </label>
          <span className="text-gray-600">שכחתי סיסמה</span>
        </div>

        <button type="submit" disabled={submitting} className={authSubmitClassName}>
          {submitting ? "מתחבר..." : "התחברות"}
        </button>
      </form>
    </AuthPageShell>
  );
}
