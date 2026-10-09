"use client";

import { PlaceGpxImport } from "@/components/features/places/place-gpx-import";
import { PlaceForm } from "@/components/features/places/place-form";
import { useAuthStore } from "@/hooks/use-stores";

export default function CreatePlacePage() {
  const { role } = useAuthStore();

  if (role === "guest") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#f9fafb] px-4" dir="rtl">
        <p className="text-center text-[#6b7280]">יש להתחבר כמשתמש כדי להוסיף מקום</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] py-12" dir="rtl">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="mb-2 text-3xl font-light text-[#111827]">הוסף מקום חדש</h1>
        <p className="mb-8 text-sm text-[#6b7280]">המקום יישלח לאישור מנהל לפני פרסום</p>
        <PlaceGpxImport />
        <PlaceForm />
      </div>
    </div>
  );
}
