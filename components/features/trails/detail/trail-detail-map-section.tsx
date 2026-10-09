"use client";

import { Download } from "lucide-react";
import type { Trail } from "@/types";
import { MapView, type MapMarker } from "@/components/ui/custom/map-view";
import { downloadGpx, gpxFilename, trailToGpx } from "@/lib/utils/gpx";
import { toast } from "@/components/ui/use-toast";

interface TrailDetailMapSectionProps {
  trail: Trail;
}

export function TrailDetailMapSection({ trail }: TrailDetailMapSectionProps) {
  const polyline: [number, number][] =
    trail.waypoints.length > 0
      ? [
          [trail.start_lat, trail.start_lng],
          ...trail.waypoints.map((w) => [w.lat, w.lng] as [number, number]),
          [trail.end_lat, trail.end_lng],
        ]
      : [
          [trail.start_lat, trail.start_lng],
          [trail.end_lat, trail.end_lng],
        ];

  const markers: MapMarker[] = [
    { lat: trail.start_lat, lng: trail.start_lng, label: "התחלה" },
    { lat: trail.end_lat, lng: trail.end_lng, label: "סיום" },
    ...trail.waypoints
      .filter((w) => w.name)
      .map((w) => ({ lat: w.lat, lng: w.lng, label: w.name ?? "תחנה" })),
  ];

  const handleDownloadGpx = () => {
    try {
      downloadGpx(gpxFilename(trail.name, trail.id), trailToGpx(trail));
    } catch {
      toast({ title: "שגיאה", description: "לא ניתן להוריד את קובץ ה-GPX", variant: "destructive" });
    }
  };

  return (
    <section>
      <h2 className="mb-6 text-3xl font-light text-[#111827]">מפה ונתיב</h2>
      <div className="overflow-hidden rounded-sm border border-[#e5e7eb]">
        <MapView
          markers={markers}
          polyline={polyline}
          center={[trail.start_lat, trail.start_lng]}
          zoom={12}
          className="h-64 w-full md:h-80"
        />
      </div>
      <button
        type="button"
        onClick={handleDownloadGpx}
        className="mx-auto mt-3 flex items-center gap-2 text-sm text-[#111827] hover:underline"
      >
        <Download className="h-4 w-4" />
        הורד קובץ GPX
      </button>
    </section>
  );
}
