"use client";

import { Download } from "lucide-react";
import { MapView, type MapMarker } from "@/components/ui/custom/map-view";

interface TripDetailMapProps {
  markers: MapMarker[];
  className?: string;
  variant?: "default" | "embedded";
}

export function TripDetailMap({ markers, className, variant = "default" }: TripDetailMapProps) {
  const center: [number, number] | undefined =
    markers.length > 0 ? [markers[0].lat, markers[0].lng] : undefined;

  const isEmbedded = variant === "embedded";

  return (
    <section className={className ?? (isEmbedded ? "mt-6" : "mt-12")}>
      <h2
        className={
          isEmbedded
            ? "mb-4 text-xl font-light text-[#111827]"
            : "mb-6 text-3xl font-light text-[#111827]"
        }
      >
        מפת הטיול
      </h2>
      {markers.length > 0 ? (
        <div className="overflow-hidden rounded-sm border border-[#e5e7eb]">
          <MapView
            markers={markers}
            center={center}
            zoom={12}
            className={isEmbedded ? "h-64 w-full md:h-72" : "h-80 w-full md:h-96"}
          />
        </div>
      ) : (
        <div
          className={`flex items-center justify-center rounded-sm border border-[#e5e7eb] bg-[#f9fafb] text-[#6b7280] ${isEmbedded ? "h-64 md:h-72" : "aspect-video"}`}
        >
          אין נקודות להצגה על המפה
        </div>
      )}
      {!isEmbedded && (
        <button
          type="button"
          className="mx-auto mt-3 flex items-center gap-2 text-sm text-[#111827] hover:underline"
        >
          <Download className="h-4 w-4" />
          הורד מסלול GPS
        </button>
      )}
    </section>
  );
}
