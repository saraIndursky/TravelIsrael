import type { Accessibility, Difficulty, Place, Region, Trail, TripStation } from "@/types";
import { calculateTotalTripMinutes } from "@/lib/utils/trip-time";

const DIFFICULTY_ORDER: Difficulty[] = ["easy", "medium", "hard"];

export interface TripStats {
  total_duration_minutes: number;
  total_distance_km: number;
  estimated_price: number;
  difficulty: Difficulty;
  accessibility: Accessibility;
  region: Region;
  station_count: number;
}

export interface StationInput {
  station_type: "place" | "trail";
  place_id: string | null;
  trail_id: string | null;
}

export function computeTripStats(
  stations: StationInput[],
  places: Place[],
  trails: Trail[]
): TripStats {
  if (stations.length === 0) {
    return {
      total_duration_minutes: 0,
      total_distance_km: 0,
      estimated_price: 0,
      difficulty: "easy",
      accessibility: 5,
      region: "מרכז",
      station_count: 0,
    };
  }

  let totalDistance = 0;
  let totalPrice = 0;
  let maxDifficulty: Difficulty = "easy";
  let minAccessibility: Accessibility = 5;
  const regions: Region[] = [];

  for (const station of stations) {
    if (station.station_type === "place" && station.place_id) {
      const place = places.find((p) => p.id === station.place_id);
      if (place) {
        totalPrice += place.estimated_price;
        minAccessibility = Math.min(minAccessibility, place.accessibility) as Accessibility;
        regions.push(place.region);
      }
    } else if (station.station_type === "trail" && station.trail_id) {
      const trail = trails.find((t) => t.id === station.trail_id);
      if (trail) {
        totalDistance += trail.length_km;
        totalPrice += trail.estimated_price;
        if (DIFFICULTY_ORDER.indexOf(trail.difficulty) > DIFFICULTY_ORDER.indexOf(maxDifficulty)) {
          maxDifficulty = trail.difficulty;
        }
        minAccessibility = Math.min(minAccessibility, trail.accessibility) as Accessibility;
        regions.push(trail.region);
      }
    }
  }

  const regionCounts = regions.reduce(
    (acc, r) => {
      acc[r] = (acc[r] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const region =
    (Object.entries(regionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as Region) ?? "מרכז";

  const totalDuration = calculateTotalTripMinutes(
    stations as TripStation[],
    places,
    trails
  );

  return {
    total_duration_minutes: totalDuration,
    total_distance_km: totalDistance,
    estimated_price: totalPrice,
    difficulty: maxDifficulty,
    accessibility: minAccessibility,
    region,
    station_count: stations.length,
  };
}

export function resolveStationDetails(
  station: TripStation,
  places: Place[],
  trails: Trail[]
): { name: string; duration: number; price: number; difficulty?: Difficulty; type: string } | null {
  if (station.station_type === "place" && station.place_id) {
    const place = places.find((p) => p.id === station.place_id);
    if (!place) return null;
    return {
      name: place.name,
      duration: place.avg_duration_minutes,
      price: place.estimated_price,
      type: place.place_type,
    };
  }
  if (station.station_type === "trail" && station.trail_id) {
    const trail = trails.find((t) => t.id === station.trail_id);
    if (!trail) return null;
    return {
      name: trail.name,
      duration: trail.duration_minutes,
      price: trail.estimated_price,
      difficulty: trail.difficulty,
      type: trail.trail_type,
    };
  }
  return null;
}
