"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, User } from "lucide-react";
import {
  AuthField,
  AuthPageShell,
  authInputClassName,
  authSubmitClassName,
} from "@/components/features/auth/auth-page-shell";
import { AuthDivider } from "@/components/features/auth/auth-divider";
import { GoogleSignInButton } from "@/components/features/auth/google-sign-in-button";
import { toast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/hooks/use-stores";
import { registerWithEmail } from "@/lib/data/auth";
import { trackEvent } from "@/lib/analytics";
import { registerSchema, type RegisterFormValues } from "@/lib/validations";

export function RegisterForm() {
  const router = useRouter();
  const { setSession } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterFormValues) {
    setSubmitting(true);
    try {
      const user = await registerWithEmail({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      });
      setSession(user);
      trackEvent("user_registered");
      toast({ title: "החשבון נוצר בהצלחה" });
      router.push("/");
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "שגיאה בהרשמה",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthPageShell
      title="מתחילים לטייל חכם"
      subtitle="הרשמה קצרה ויוצאים לדרך"
      backgroundImage="https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&h=1080&fit=crop"
      footer={
        <>
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              כבר יש לך חשבון?{" "}
              <Link href="/login" className="font-medium text-gray-900 hover:underline">
                להתחברות
              </Link>
            </p>
          </div>
          <div className="mt-6 text-center">
            <p className="text-xs leading-relaxed text-gray-500">
              בהרשמה אתם מסכימים ל
              <span className="underline">תנאי השימוש</span> ול
              <span className="underline">מדיניות הפרטיות</span>
            </p>
          </div>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <AuthField
          label="שם פרטי"
          error={errors.firstName?.message}
          icon={<User className="h-4 w-4" />}
        >
          <input
            type="text"
            autoComplete="given-name"
            placeholder="השם הפרטי"
            className={authInputClassName}
            {...register("firstName")}
          />
        </AuthField>

        <AuthField
          label="שם משפחה"
          error={errors.lastName?.message}
          icon={<User className="h-4 w-4" />}
        >
          <input
            type="text"
            autoComplete="family-name"
            placeholder="שם המשפחה"
            className={authInputClassName}
            {...register("lastName")}
          />
        </AuthField>

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
            autoComplete="new-password"
            placeholder="לפחות 8 תווים"
            className={authInputClassName}
            {...register("password")}
          />
        </AuthField>

        <AuthField
          label="אימות סיסמה"
          error={errors.confirmPassword?.message}
          icon={<Lock className="h-4 w-4" />}
        >
          <input
            type="password"
            autoComplete="new-password"
            placeholder="חזור על הסיסמה"
            className={authInputClassName}
            {...register("confirmPassword")}
          />
        </AuthField>

        <button type="submit" disabled={submitting} className={`${authSubmitClassName} mt-6`}>
          {submitting ? "יוצר חשבון..." : "יצירת חשבון"}
        </button>

        <AuthDivider />
        <GoogleSignInButton nextPath="/" />
      </form>
    </AuthPageShell>
  );
}
