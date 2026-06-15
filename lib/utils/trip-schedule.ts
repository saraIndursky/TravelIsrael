import type { Place, Trail, TripStation } from "@/types";
import {
  formatStopDuration,
  getStationEntryLocation,
  getStationExitLocation,
} from "@/lib/utils/trip-time";

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getStationDuration(
  station: TripStation,
  places: Place[],
  trails: Trail[]
): number {
  if (station.station_type === "place" && station.place_id) {
    return places.find((p) => p.id === station.place_id)?.avg_duration_minutes ?? 60;
  }
  if (station.station_type === "trail" && station.trail_id) {
    return trails.find((t) => t.id === station.trail_id)?.duration_minutes ?? 90;
  }
  return 60;
}

function roundToHalfHour(date: Date) {
  const next = new Date(date);
  const minutes = next.getMinutes();
  if (minutes < 15) next.setMinutes(0, 0, 0);
  else if (minutes < 45) next.setMinutes(30, 0, 0);
  else {
    next.setHours(next.getHours() + 1);
    next.setMinutes(0, 0, 0);
  }
  return next;
}

function formatClock(date: Date) {
  return date.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export { formatStopDuration };

export interface TripScheduleItem {
  arrivalTime: string;
  stayDuration: string;
  travelToNext: string | null;
}

export function computeTripSchedule(
  stations: TripStation[],
  places: Place[],
  trails: Trail[],
  startHour = 9
): { items: TripScheduleItem[]; totalTravelKm: number } {
  if (stations.length === 0) {
    return { items: [], totalTravelKm: 0 };
  }

  const sorted = [...stations].sort((a, b) => a.order_index - b.order_index);
  let current = new Date();
  current.setHours(startHour, 0, 0, 0);
  let totalTravelKm = 0;
  const items: TripScheduleItem[] = [];

  sorted.forEach((station, index) => {
    const arrival = roundToHalfHour(current);
    const durationMinutes = getStationDuration(station, places, trails);
    const stayDuration = formatStopDuration(durationMinutes);

    let travelToNext: string | null = null;
    const nextStation = sorted[index + 1];
    if (nextStation) {
      const from = getStationExitLocation(station, places, trails);
      const to = getStationEntryLocation(nextStation, places, trails);
      if (from && to) {
        const km = getDistanceKm(from.lat, from.lng, to.lat, to.lng);
        totalTravelKm += km;
        const mode = station.travel_mode ?? "car";
        const speeds = { walking: 5, car: 60, bike: 15 } as const;
        const travelMinutes = Math.max(5, Math.round((km / speeds[mode]) * 60));
        const modeLabel = mode === "walking" ? "הליכה" : mode === "bike" ? "אופניים" : "נסיעה";
        travelToNext = `${km.toFixed(1)} ק"מ ${modeLabel}`;
        current = new Date(arrival.getTime() + durationMinutes * 60_000 + travelMinutes * 60_000);
      } else {
        current = new Date(arrival.getTime() + durationMinutes * 60_000);
      }
    } else {
      current = new Date(arrival.getTime() + durationMinutes * 60_000);
    }

    items.push({
      arrivalTime: formatClock(arrival),
      stayDuration,
      travelToNext,
    });
  });

  return { items, totalTravelKm };
}
