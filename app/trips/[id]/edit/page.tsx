"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import type { TripWithStations } from "@/types";
import { BuildTripForm } from "@/components/features/trips/build-trip-form";
import { canEditTrip, getTripById } from "@/lib/data/trips";
import { useAuthStore } from "@/hooks/use-stores";
import { useCanonicalContentPath } from "@/hooks/use-canonical-content-path";
import { useSessionReady } from "@/hooks/use-session-ready";
import { tripEditPath } from "@/lib/utils/content-path";

export default function EditTripPage({ params }: { params: { id: string } }) {
  const { role, userId } = useAuthStore();
  const sessionReady = useSessionReady();
  const [trip, setTrip] = useState<TripWithStations | null | undefined>(undefined);

  useEffect(() => {
    if (!sessionReady) return;
    let cancelled = false;
    getTripById(params.id).then((t) => {
      if (!cancelled) setTrip(t ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [params.id, sessionReady]);

  useCanonicalContentPath(params.id, trip ? tripEditPath(trip) : null);

  if (!sessionReady || trip === undefined) {
    return (
      <div className="mx-auto max-w-7xl animate-pulse px-4 py-12 md:px-6">
        <div className="h-96 rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!trip) notFound();

  if (!canEditTrip(trip, role, userId || null)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#f9fafb] px-4" dir="rtl">
        <p className="text-center text-[#6b7280]">
          {trip.status === "approved"
            ? "טיול מאושר ניתן לעריכה על ידי מנהל בלבד"
            : "אין הרשאה לערוך טיול זה"}
        </p>
      </div>
    );
  }

  return (
    <BuildTripForm
      mode="edit"
      tripId={trip.id}
      initialTrip={trip}
      editHint={
        role === "admin"
          ? "עריכה כמנהל — הסטטוס לא ישתנה"
          : trip.status === "draft"
            ? "שמירה תשאיר את הטיול כטיוטה; שליחה לאישור תעביר אותו לבדיקת מנהל"
            : "לאחר השמירה הטיול יישלח שוב לאישור מנהל"
      }
    />
  );
}
