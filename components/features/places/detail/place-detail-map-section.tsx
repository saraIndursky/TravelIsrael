"use client";

import { Download } from "lucide-react";
import type { Place } from "@/types";
import { MapView } from "@/components/ui/custom/map-view";
import { downloadGpx, gpxFilename, placeToGpx } from "@/lib/utils/gpx";
import { toast } from "@/components/ui/use-toast";

interface PlaceDetailMapSectionProps {
  place: Place;
}

export function PlaceDetailMapSection({ place }: PlaceDetailMapSectionProps) {
  const handleDownloadGpx = () => {
    try {
      downloadGpx(gpxFilename(place.name, place.id), placeToGpx(place));
    } catch {
      toast({ title: "שגיאה", description: "לא ניתן להוריד את קובץ ה-GPX", variant: "destructive" });
    }
  };

  return (
    <section className="print-keep-together">
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
      <button
        type="button"
        onClick={handleDownloadGpx}
        className="mx-auto mt-3 flex items-center gap-2 text-sm text-[#111827] hover:underline print:hidden"
      >
        <Download className="h-4 w-4" />
        הורדת מיקום GPS
      </button>
    </section>
  );
}
