"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import type { Trail } from "@/types";
import { TrailForm } from "@/components/features/trails/trail-form";
import { canEditTrail, getTrailById } from "@/lib/data/trails";
import { useAuthStore } from "@/hooks/use-stores";
import { useCanonicalContentPath } from "@/hooks/use-canonical-content-path";
import { useSessionReady } from "@/hooks/use-session-ready";
import { trailEditPath } from "@/lib/utils/content-path";

export default function EditTrailPage({ params }: { params: { id: string } }) {
  const { role, userId } = useAuthStore();
  const { ready: sessionReady, hasSession } = useSessionReady();
  const [trail, setTrail] = useState<Trail | null | undefined>(undefined);

  useEffect(() => {
    if (!sessionReady) return;
    let cancelled = false;
    getTrailById(params.id).then((t) => {
      if (!cancelled) setTrail(t ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [params.id, sessionReady]);

  useCanonicalContentPath(params.id, trail ? trailEditPath(trail) : null);

  if (!sessionReady || trail === undefined) {
    return (
      <div className="mx-auto max-w-7xl animate-pulse px-4 py-12 md:px-6">
        <div className="h-96 rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!trail) notFound();

  if (!canEditTrail(trail, role, userId || null)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#f9fafb] px-4" dir="rtl">
        <p className="text-center text-[#6b7280]">
          {trail.status === "approved"
            ? "מסלול מאושר ניתן לעריכה על ידי מנהל בלבד"
            : "אין הרשאה לערוך מסלול זה"}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] py-12" dir="rtl">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="mb-2 text-3xl font-light text-[#111827]">עריכת מסלול</h1>
        <p className="mb-8 text-sm text-[#6b7280]">
          {role === "admin"
            ? "עריכה כמנהל — הסטטוס לא ישתנה"
            : "לאחר השמירה המסלול יישלח שוב לאישור מנהל"}
        </p>
        <TrailForm mode="edit" trailId={trail.id} initialTrail={trail} />
      </div>
    </div>
  );
}
