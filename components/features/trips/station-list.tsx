"use client";

import type { Place, Trail, TripStation } from "@/types";
import { resolveStationDetails } from "@/lib/utils/trip-calculations";
import { usePlacesTrailsCatalog } from "@/hooks/use-catalog";
import { GripVertical, MapPin, Route } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface StationListProps {
  stations: TripStation[];
  readOnly?: boolean;
  onReorder?: (stations: TripStation[]) => void;
}

export function StationList({ stations, readOnly = true }: StationListProps) {
  const { places, trails } = usePlacesTrailsCatalog();
  const sorted = [...stations].sort((a, b) => a.order_index - b.order_index);

  if (sorted.length === 0) {
    return <p className="text-muted-foreground text-sm py-4">אין תחנות בטיול זה</p>;
  }

  return (
    <ol className="space-y-2">
      {sorted.map((station, i) => {
        const details = resolveStationDetails(station, places, trails);
        if (!details) return null;
        return (
          <li key={station.id} className="flex items-center gap-3 rounded-lg border p-3 bg-card">
            {!readOnly && <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />}
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
              {i + 1}
            </span>
            {station.station_type === "place" ? (
              <MapPin className="h-4 w-4 text-blue-500 shrink-0" />
            ) : (
              <Route className="h-4 w-4 text-green-500 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{details.name}</p>
              <p className="text-xs text-muted-foreground">{details.type} · {formatDuration(details.duration)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
