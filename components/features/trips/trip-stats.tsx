import type { Trip } from "@/types";
import { Clock, DollarSign, MapPin, Mountain, Users } from "lucide-react";
import { DifficultyBadge } from "@/components/ui/custom/badges";
import { formatDistance, formatDuration, formatPrice, getAccessibilityLabel } from "@/lib/utils";

interface TripStatsProps {
  trip: Pick<Trip, "total_duration_minutes" | "total_distance_km" | "estimated_price" | "difficulty" | "accessibility" | "region" | "station_count">;
}

export function TripStats({ trip }: TripStatsProps) {
  return (
    <div className="ti-card p-6">
      <h3 className="mb-4 text-base font-semibold">סטטיסטיקות</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /><span>משך: {formatDuration(trip.total_duration_minutes)}</span></div>
        <div className="flex items-center gap-2"><Mountain className="h-4 w-4 text-primary" /><span>מרחק: {formatDistance(trip.total_distance_km)}</span></div>
        <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /><span>מחיר: {formatPrice(trip.estimated_price)}</span></div>
        <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /><span>אזור: {trip.region}</span></div>
        <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /><span>{getAccessibilityLabel(trip.accessibility)}</span></div>
        <div className="flex items-center gap-2"><span className="font-medium">קושי:</span><DifficultyBadge difficulty={trip.difficulty} /></div>
        <div className="col-span-2 text-muted-foreground">{trip.station_count} תחנות</div>
      </div>
    </div>
  );
}
