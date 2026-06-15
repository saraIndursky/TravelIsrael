"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTrailById } from "@/lib/data/trails";
import { getTripsContainingEntity } from "@/lib/data/trips";
import type { Trail, Trip } from "@/types";
import { DifficultyBadge } from "@/components/ui/custom/badges";
import { TripCard } from "@/components/features/trips/trip-card";
import { MapView } from "@/components/ui/custom/map-view";
import { PageShell } from "@/components/layout/page-shell";
import { formatDistance, formatDuration, formatPrice, getAccessibilityLabel } from "@/lib/utils";

export default function TrailDetailClient({ id }: { id: string }) {
  const [trail, setTrail] = useState<Trail | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    getTrailById(id).then(async (t) => {
      if (!t) return;
      setTrail(t);
      setTrips(await getTripsContainingEntity("trail", id));
    });
  }, [id]);

  if (trail === null) return <div className="ti-container py-12 animate-pulse h-96 bg-muted rounded-2xl" />;
  if (!trail) notFound();

  const polyline: [number, number][] = trail.waypoints.length > 0
    ? trail.waypoints.map((w) => [w.lat, w.lng] as [number, number])
    : [[trail.start_lat, trail.start_lng], [trail.end_lat, trail.end_lng]];

  return (
    <div className="bg-white">
      <div className="relative aspect-video max-h-[400px] w-full overflow-hidden">
        <Image src={trail.image_url} alt={trail.name} fill className="object-cover" sizes="100vw" />
      </div>
      <PageShell
        title={trail.name}
        subtitle={`${trail.region} · ${trail.trail_type}`}
        action={<DifficultyBadge difficulty={trail.difficulty} />}
      >
        <div className="space-y-8">
          <p className="text-muted-foreground leading-relaxed max-w-3xl">{trail.full_description}</p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="ti-card p-4 text-sm"><span className="text-muted-foreground">אורך: </span>{formatDistance(trail.length_km)}</div>
            <div className="ti-card p-4 text-sm"><span className="text-muted-foreground">משך: </span>{formatDuration(trail.duration_minutes)}</div>
            <div className="ti-card p-4 text-sm"><span className="text-muted-foreground">מחיר: </span>{formatPrice(trail.estimated_price)}</div>
            <div className="ti-card p-4 text-sm"><span className="text-muted-foreground">נגישות: </span>{getAccessibilityLabel(trail.accessibility)}</div>
          </div>
          <MapView
            markers={[
              { lat: trail.start_lat, lng: trail.start_lng, label: "התחלה" },
              { lat: trail.end_lat, lng: trail.end_lng, label: "סיום" },
            ]}
            polyline={polyline}
            center={[trail.start_lat, trail.start_lng]}
            className="h-80 rounded-2xl overflow-hidden"
          />
          {trips.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">טיולים הכוללים מסלול זה</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {trips.map((t) => <TripCard key={t.id} trip={t} showFavorite />)}
              </div>
            </section>
          )}
        </div>
      </PageShell>
    </div>
  );
}
