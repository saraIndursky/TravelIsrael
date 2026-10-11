"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { AdminPageHeader } from "@/components/features/admin/admin-page-header";

export function AdminAccessGate() {
  return (
    <div className="mx-auto max-w-lg py-12">
      <AdminPageHeader title="גישה מוגבלת" subtitle="פאנל ניהול" />
      <div className="ti-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <ShieldAlert className="h-7 w-7 text-muted-foreground" aria-hidden />
        </div>
        <p className="text-foreground font-medium">אזור זה מיועד למנהלים בלבד</p>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            התחברות
          </Link>{" "}
          עם חשבון מנהל כדי להיכנס לפאנל הניהול.
        </p>
      </div>
    </div>
  );
}
