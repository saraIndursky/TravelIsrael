"use client";

import { BuildTripForm } from "@/components/features/trips/build-trip-form";
import { useAuthStore } from "@/hooks/use-stores";

export default function CreateTripPage() {
  const { role } = useAuthStore();

  if (role === "guest") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#f9fafb] px-4" dir="rtl">
        <p className="text-center text-[#6b7280]">יש להתחבר כמשתמש כדי ליצור טיול</p>
      </div>
    );
  }

  return <BuildTripForm mode="create" />;
}
