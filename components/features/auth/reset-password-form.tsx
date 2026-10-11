"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { z } from "zod";
import {
  AuthField,
  AuthPageShell,
  authInputClassName,
  authSubmitClassName,
} from "@/components/features/auth/auth-page-shell";
import { toast } from "@/components/ui/use-toast";
import { getCurrentUser, updatePasswordAfterReset } from "@/lib/data/auth";
import { ClientPageLoading } from "@/components/layout/page-loading";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "הסיסמה חייבת להכיל לפחות 8 תווים"),
    confirmPassword: z.string().min(1, "יש לאמת את הסיסמה"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "הסיסמאות אינן תואמות",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then((user) => {
      if (cancelled) return;
      setHasSession(Boolean(user));
      setChecking(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(values: ResetPasswordValues) {
    setSubmitting(true);
    try {
      await updatePasswordAfterReset(values.password);
      toast({ title: "הסיסמה עודכנה — אפשר להתחבר" });
      router.push("/login");
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "עדכון הסיסמה נכשל",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return <ClientPageLoading />;
  }

  if (!hasSession) {
    return (
      <AuthPageShell
        title="קישור לא תקין"
        subtitle="יש לבקש איפוס סיסמה מחדש"
        backgroundImage="https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Mount-Arbel-189.jpg/1920px-Mount-Arbel-189.jpg"
      >
        <div className="space-y-4 text-sm text-gray-600">
          <p>הקישור פג תוקף או שכבר נוצל. בקשו קישור חדש מדף איפוס הסיסמה.</p>
          <Link href="/forgot-password" className={authSubmitClassName}>
            בקשת איפוס מחדש
          </Link>
        </div>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      title="סיסמה חדשה"
      subtitle="בחרו סיסמה חזקה (לפחות 8 תווים)"
      backgroundImage="https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Mount-Arbel-189.jpg/1920px-Mount-Arbel-189.jpg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AuthField label="סיסמה חדשה" error={errors.password?.message} icon={<Lock className="h-4 w-4" />}>
          <input
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
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
            placeholder="••••••••"
            className={authInputClassName}
            {...register("confirmPassword")}
          />
        </AuthField>

        <button type="submit" disabled={submitting} className={authSubmitClassName}>
          {submitting ? "מעדכן..." : "עדכון סיסמה"}
        </button>
      </form>
    </AuthPageShell>
  );
}
