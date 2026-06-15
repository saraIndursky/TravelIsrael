"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPlaceById } from "@/lib/data/places";
import { getTripsContainingEntity } from "@/lib/data/trips";
import type { Place, Trip } from "@/types";
import { TripCard } from "@/components/features/trips/trip-card";
import { MapView } from "@/components/ui/custom/map-view";
import { PageShell } from "@/components/layout/page-shell";
import { formatDuration, formatPrice, getAccessibilityLabel } from "@/lib/utils";

export default function PlaceDetailClient({ id }: { id: string }) {
  const [place, setPlace] = useState<Place | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    getPlaceById(id).then(async (p) => {
      if (!p) return;
      setPlace(p);
      setTrips(await getTripsContainingEntity("place", id));
    });
  }, [id]);

  if (place === null) return <div className="ti-container py-12 animate-pulse h-96 bg-muted rounded-2xl" />;
  if (!place) notFound();

  return (
    <div className="bg-white">
      <div className="relative aspect-video max-h-[400px] w-full overflow-hidden">
        <Image src={place.image_url} alt={place.name} fill className="object-cover" sizes="100vw" />
      </div>
      <PageShell title={place.name} subtitle={`${place.region} · ${place.place_type}`}>
        <div className="space-y-8">
          <p className="text-muted-foreground leading-relaxed max-w-3xl">{place.full_description}</p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="ti-card p-4 text-sm"><span className="text-muted-foreground">משך: </span>{formatDuration(place.avg_duration_minutes)}</div>
            <div className="ti-card p-4 text-sm"><span className="text-muted-foreground">מחיר: </span>{formatPrice(place.estimated_price)}</div>
            <div className="ti-card p-4 text-sm"><span className="text-muted-foreground">נגישות: </span>{getAccessibilityLabel(place.accessibility)}</div>
            <div className="ti-card p-4 text-sm"><span className="text-muted-foreground">כתובת: </span>{place.address}</div>
          </div>
          <MapView markers={[{ lat: place.lat, lng: place.lng, label: place.name }]} center={[place.lat, place.lng]} className="h-64 rounded-2xl overflow-hidden" />
          {trips.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">טיולים הכוללים מקום זה</h2>
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
