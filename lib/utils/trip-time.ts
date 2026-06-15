import type { Place, Trail, TripStation, TravelMode } from "@/types";

type Location = { lat: number; lng: number };

const TRAVEL_SPEEDS: Record<TravelMode, number> = {
  walking: 5,
  car: 60,
  bike: 15,
};

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

function getTravelMinutes(distanceKm: number, mode: TravelMode): number {
  const speed = TRAVEL_SPEEDS[mode] ?? 5;
  return (distanceKm / speed) * 60;
}

function getStationDurationMinutes(
  station: TripStation,
  places: Place[],
  trails: Trail[]
): number {
  if (station.station_type === "place" && station.place_id) {
    return places.find((p) => p.id === station.place_id)?.avg_duration_minutes ?? 0;
  }
  if (station.station_type === "trail" && station.trail_id) {
    return trails.find((t) => t.id === station.trail_id)?.duration_minutes ?? 0;
  }
  return 0;
}

/** נקודת כניסה לתחנה — מקום: lat/lng, מסלול: נקודת התחלה */
export function getStationEntryLocation(
  station: TripStation,
  places: Place[],
  trails: Trail[]
): Location | null {
  if (station.station_type === "place" && station.place_id) {
    const place = places.find((p) => p.id === station.place_id);
    return place ? { lat: place.lat, lng: place.lng } : null;
  }
  if (station.station_type === "trail" && station.trail_id) {
    const trail = trails.find((t) => t.id === station.trail_id);
    return trail ? { lat: trail.start_lat, lng: trail.start_lng } : null;
  }
  return null;
}

/** נקודת יציאה מתחנה — מקום: lat/lng, מסלול: נקודת סיום */
export function getStationExitLocation(
  station: TripStation,
  places: Place[],
  trails: Trail[]
): Location | null {
  if (station.station_type === "place" && station.place_id) {
    const place = places.find((p) => p.id === station.place_id);
    return place ? { lat: place.lat, lng: place.lng } : null;
  }
  if (station.station_type === "trail" && station.trail_id) {
    const trail = trails.find((t) => t.id === station.trail_id);
    return trail ? { lat: trail.end_lat, lng: trail.end_lng } : null;
  }
  return null;
}

export function formatStopDuration(minutes: number): string {
  const hours = minutes / 60;
  if (hours === 1) return "שעה";
  if (hours === 2) return "שעתיים";
  if (Number.isInteger(hours)) return `${hours} שעות`;
  if (hours < 1) return `${minutes} דקות`;
  return `${hours.toFixed(1)} שעות`;
}

function formatSegmentDistance(distanceKm: number, mode: TravelMode): string {
  const rounded = Math.round(distanceKm * 10) / 10;
  const modeText: Record<TravelMode, string> = {
    walking: "הליכה",
    car: "נסיעה",
    bike: "אופניים",
  };
  return `${rounded} ק"מ ${modeText[mode]}`;
}

/** זמן כולל = משך כל תחנה + זמן מעבר בין תחנות (לפי מרחק ואופן הגעה) */
export function calculateTotalTripMinutes(
  stations: TripStation[],
  places: Place[],
  trails: Trail[]
): number {
  if (stations.length === 0) return 0;

  const sorted = [...stations].sort((a, b) => a.order_index - b.order_index);
  let totalMinutes = 0;

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    totalMinutes += getStationDurationMinutes(current, places, trails);

    const next = sorted[i + 1];
    if (!next) continue;

    const exit = getStationExitLocation(current, places, trails);
    const entry = getStationEntryLocation(next, places, trails);
    if (!exit || !entry) continue;

    const distance = getDistanceKm(exit.lat, exit.lng, entry.lat, entry.lng);
    const mode = current.travel_mode ?? "car";
    totalMinutes += getTravelMinutes(distance, mode);
  }

  return Math.round(totalMinutes);
}

/** מרחק מעבר בין תחנות (לא כולל אורך מסלולי הליכה) */
export function calculateSegmentDistances(
  stations: TripStation[],
  places: Place[],
  trails: Trail[]
): (string | null)[] {
  if (stations.length === 0) return [];

  const sorted = [...stations].sort((a, b) => a.order_index - b.order_index);
  const result: (string | null)[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    if (!next) {
      result.push(null);
      continue;
    }

    const exit = getStationExitLocation(current, places, trails);
    const entry = getStationEntryLocation(next, places, trails);
    if (!exit || !entry) {
      result.push(null);
      continue;
    }

    const distance = getDistanceKm(exit.lat, exit.lng, entry.lat, entry.lng);
    const mode = current.travel_mode ?? "car";
    result.push(formatSegmentDistance(distance, mode));
  }

  return result;
}

export function normalizeTravelModes(stations: TripStation[]): TripStation[] {
  return stations.map((station, index) => ({
    ...station,
    travel_mode: index === stations.length - 1 ? undefined : (station.travel_mode ?? "car"),
  }));
}
