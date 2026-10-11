"use client";

import { TrailGpxImport } from "@/components/features/trails/trail-gpx-import";
import { TrailForm } from "@/components/features/trails/trail-form";
import { useAuthStore } from "@/hooks/use-stores";

export default function CreateTrailPage() {
  const { role } = useAuthStore();

  if (role === "guest") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#f9fafb] px-4" dir="rtl">
        <p className="text-center text-[#6b7280]">יש להתחבר כמשתמש כדי להוסיף מסלול</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] py-12" dir="rtl">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="mb-2 text-3xl font-light text-[#111827]">הוספת מסלול חדש</h1>
        <p className="mb-8 text-sm text-[#6b7280]">המסלול יישליחה לאישור מנהל לפני פרסום</p>
        <TrailGpxImport />
        <TrailForm />
      </div>
    </div>
  );
}
