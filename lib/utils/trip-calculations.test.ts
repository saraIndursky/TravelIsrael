import { describe, expect, it } from "vitest";
import { computeTripStats, resolveStationDetails } from "@/lib/utils/trip-calculations";
import { createPlace, createTrail } from "@/lib/test/fixtures";
import type { TripStation } from "@/types";

describe("computeTripStats", () => {
  it("returns zeroed defaults for an empty station list", () => {
    expect(computeTripStats([], [], [])).toEqual({
      total_duration_minutes: 0,
      total_distance_km: 0,
      estimated_price: 0,
      difficulty: "easy",
      accessibility: 5,
      region: "מרכז",
      station_count: 0,
    });
  });

  it("aggregates place price, accessibility, and region", () => {
    const place = createPlace({
      id: "p1",
      estimated_price: 40,
      accessibility: 3,
      region: "ירושלים",
      avg_duration_minutes: 90,
    });

    const stats = computeTripStats(
      [{ station_type: "place", place_id: "p1", trail_id: null }],
      [place],
      []
    );

    expect(stats.estimated_price).toBe(40);
    expect(stats.accessibility).toBe(3);
    expect(stats.region).toBe("ירושלים");
    expect(stats.station_count).toBe(1);
    expect(stats.total_duration_minutes).toBe(90);
    expect(stats.total_distance_km).toBe(0);
  });

  it("uses trail length for distance and max difficulty across stations", () => {
    const place = createPlace({ id: "p1", region: "מרכז", accessibility: 4 });
    const trail = createTrail({
      id: "t1",
      length_km: 12,
      difficulty: "hard",
      accessibility: 2,
      region: "צפון",
      duration_minutes: 200,
      estimated_price: 30,
    });

    const stats = computeTripStats(
      [
        { station_type: "place", place_id: "p1", trail_id: null },
        { station_type: "trail", place_id: null, trail_id: "t1" },
      ],
      [place],
      [trail]
    );

    expect(stats.total_distance_km).toBe(12);
    expect(stats.difficulty).toBe("hard");
    expect(stats.accessibility).toBe(2);
    expect(stats.estimated_price).toBe(80);
    expect(stats.region).toBe("מרכז");
    expect(stats.station_count).toBe(2);
  });
});

describe("resolveStationDetails", () => {
  it("returns place details for a place station", () => {
    const place = createPlace({ id: "p1", name: "גן לאומי", avg_duration_minutes: 75 });
    const station: TripStation = {
      id: "s1",
      trip_id: "trip-1",
      order_index: 0,
      station_type: "place",
      place_id: "p1",
      trail_id: null,
    };

    expect(resolveStationDetails(station, [place], [])).toEqual({
      name: "גן לאומי",
      duration: 75,
      price: place.estimated_price,
      type: place.place_type,
    });
  });

  it("returns null when the referenced entity is missing", () => {
    const station: TripStation = {
      id: "s1",
      trip_id: "trip-1",
      order_index: 0,
      station_type: "trail",
      place_id: null,
      trail_id: "missing",
    };

    expect(resolveStationDetails(station, [], [])).toBeNull();
  });
});
