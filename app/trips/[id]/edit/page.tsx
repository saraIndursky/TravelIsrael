"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import type { TripWithStations } from "@/types";
import { BuildTripForm } from "@/components/features/trips/build-trip-form";
import { getTripById } from "@/lib/data/trips";
import { useAuthStore } from "@/hooks/use-stores";

export default function EditTripPage({ params }: { params: { id: string } }) {
  const { role, userId } = useAuthStore();
  const [trip, setTrip] = useState<TripWithStations | null | undefined>(undefined);

  useEffect(() => {
    getTripById(params.id).then((t) => setTrip(t ?? null));
  }, [params.id]);

  if (trip === undefined) {
    return (
      <div className="mx-auto max-w-7xl animate-pulse px-4 py-12 md:px-6">
        <div className="h-96 rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!trip) notFound();

  const canEdit = role === "admin" || trip.created_by === userId;
  if (!canEdit) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#f9fafb] px-4" dir="rtl">
        <p className="text-center text-[#6b7280]">אין הרשאה לערוך טיול זה</p>
      </div>
    );
  }

  return <BuildTripForm mode="edit" tripId={params.id} initialTrip={trip} />;
}
