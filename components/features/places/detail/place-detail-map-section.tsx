"use client";

import type { Place } from "@/types";
import { MapView } from "@/components/ui/custom/map-view";

interface PlaceDetailMapSectionProps {
  place: Place;
}

export function PlaceDetailMapSection({ place }: PlaceDetailMapSectionProps) {
  return (
    <section>
      <h2 className="mb-6 text-3xl font-light text-[#111827]">מיקום</h2>
      <div className="overflow-hidden rounded-sm border border-[#e5e7eb]">
        <MapView
          markers={[{ lat: place.lat, lng: place.lng, label: place.name }]}
          center={[place.lat, place.lng]}
          zoom={14}
          className="h-64 w-full md:h-80"
        />
      </div>
      <p className="mt-3 text-sm text-[#6b7280]">{place.address}</p>
    </section>
  );
}
