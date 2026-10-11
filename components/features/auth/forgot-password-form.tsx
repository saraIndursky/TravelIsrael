"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { z } from "zod";
import {
  AuthField,
  AuthPageShell,
  authInputClassName,
  authSubmitClassName,
} from "@/components/features/auth/auth-page-shell";
import { toast } from "@/components/ui/use-toast";
import { requestPasswordReset } from "@/lib/data/auth";

const forgotPasswordSchema = z.object({
  email: z.string().email("יש להזין כתובת אימייל תקינה"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setSubmitting(true);
    try {
      await requestPasswordReset(values.email);
      setSent(true);
      toast({ title: "אם קיים חשבון עם האימייל — נשליחת קישור לאיפוס" });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "שגיאה בשליחה",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthPageShell
      title="איפוס סיסמה"
      subtitle="נשלח לך קישור לאיפוס הסיסמה באימייל"
      backgroundImage="https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Mount-Arbel-189.jpg/1920px-Mount-Arbel-189.jpg"
      footer={
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            זוכרים את הסיסמה?{" "}
            <Link href="/login" className="font-medium text-gray-900 hover:underline">
              להתחברות
            </Link>
          </p>
        </div>
      }
    >
      {sent ? (
        <div className="space-y-4 text-sm text-gray-600">
          <p>
            אם קיים חשבון עם הכתובת שהזנת, נשלח אליה קישור לאיפוס. בדקו גם בתיקיית הספאם.
          </p>
          <Link href="/login" className={authSubmitClassName}>
            חזרה להתחברות
          </Link>
        </div>
      ) : (
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

          <button type="submit" disabled={submitting} className={authSubmitClassName}>
            {submitting ? "שולח..." : "שליחת קישור לאיפוס"}
          </button>
        </form>
      )}
    </AuthPageShell>
  );
}
