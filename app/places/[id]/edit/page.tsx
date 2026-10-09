"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import type { Place } from "@/types";
import { PlaceForm } from "@/components/features/places/place-form";
import { canEditPlace, getPlaceById } from "@/lib/data/places";
import { useAuthStore } from "@/hooks/use-stores";
import { useCanonicalContentPath } from "@/hooks/use-canonical-content-path";
import { useSessionReady } from "@/hooks/use-session-ready";
import { placeEditPath } from "@/lib/utils/content-path";

export default function EditPlacePage({ params }: { params: { id: string } }) {
  const { role, userId } = useAuthStore();
  const { ready: sessionReady, hasSession } = useSessionReady();
  const [place, setPlace] = useState<Place | null | undefined>(undefined);

  useEffect(() => {
    if (!sessionReady) return;
    let cancelled = false;
    getPlaceById(params.id).then((p) => {
      if (!cancelled) setPlace(p ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [params.id, sessionReady]);

  useCanonicalContentPath(params.id, place ? placeEditPath(place) : null);

  if (!sessionReady || place === undefined) {
    return (
      <div className="mx-auto max-w-7xl animate-pulse px-4 py-12 md:px-6">
        <div className="h-96 rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!place) notFound();

  if (!canEditPlace(place, role, userId || null)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#f9fafb] px-4" dir="rtl">
        <p className="text-center text-[#6b7280]">
          {place.status === "approved"
            ? "מקום מאושר ניתן לעריכה על ידי מנהל בלבד"
            : "אין הרשאה לערוך מקום זה"}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] py-12" dir="rtl">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="mb-2 text-3xl font-light text-[#111827]">עריכת מקום</h1>
        <p className="mb-8 text-sm text-[#6b7280]">
          {role === "admin"
            ? "עריכה כמנהל — הסטטוס לא ישתנה"
            : "לאחר השמירה המקום יישלח שוב לאישור מנהל"}
        </p>
        <PlaceForm mode="edit" placeId={place.id} initialPlace={place} />
      </div>
    </div>
  );
}
