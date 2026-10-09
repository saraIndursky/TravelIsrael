import { describe, expect, it } from "vitest";
import {
  buildGpxDocument,
  gpxFilename,
  gpxImportToCreatePlaceInput,
  gpxImportToCreateTrailInput,
  isTravelIsraelGpx,
  parseGpx,
  parseTravelIsraelTripGpx,
  placeToGpx,
  trailToGpx,
  tripToGpx,
} from "@/lib/utils/gpx";
import type { Place, Trail, Trip, TripStation } from "@/types";

const place = {
  id: "a0000001-0000-4000-8000-000000000001",
  name: "חוף הכרמל & טבע",
  short_description: "תיאור קצר",
  full_description: "תיאור מלא של המקום",
  address: "חיפה",
  lat: 32.8,
  lng: 34.95,
  region: "כרמל",
  place_type: "חוף",
  accessibility: 3,
  tags: [],
  avg_duration_minutes: 60,
  estimated_price: 0,
  image_url: "https://example.com/p.jpg",
  created_by: "u1",
  status: "approved",
  updated_at: "2026-01-01T00:00:00Z",
} satisfies Place;

const trail = {
  id: "b0000001-0000-4000-8000-000000000001",
  name: "נחל דוגמה",
  short_description: "מסלול קצר",
  full_description: "תיאור מלא",
  region: "צפון",
  trail_type: "הליכה",
  length_km: 5,
  duration_minutes: 120,
  difficulty: "easy",
  accessibility: 2,
  tags: [],
  estimated_price: 0,
  start_lat: 33.0,
  start_lng: 35.0,
  end_lat: 33.1,
  end_lng: 35.1,
  waypoints: [{ lat: 33.05, lng: 35.05, name: "מעיין" }],
  image_url: "https://example.com/t.jpg",
  created_by: "u1",
  status: "approved",
  updated_at: "2026-01-01T00:00:00Z",
} satisfies Trail;

describe("buildGpxDocument", () => {
  it("escapes XML special characters in names", () => {
    const xml = buildGpxDocument({
      name: 'A & B <test>',
      waypoints: [{ lat: 1, lng: 2, name: "X\"Y" }],
    });
    expect(xml).toContain("&amp;");
    expect(xml).toContain("&lt;");
    expect(xml).toContain("&gt;");
    expect(xml).toContain("&quot;");
    expect(xml).not.toContain("<test>");
  });

  it("skips invalid coordinates", () => {
    const xml = buildGpxDocument({
      name: "t",
      waypoints: [
        { lat: 32, lng: 34, name: "ok" },
        { lat: Number.NaN, lng: 1, name: "bad" },
      ],
    });
    expect(xml).toContain('lat="32"');
    expect(xml).not.toContain("bad");
  });
});

describe("placeToGpx / trailToGpx / tripToGpx", () => {
  it("exports a place as a waypoint", () => {
    const xml = placeToGpx(place);
    expect(xml).toContain("<gpx version=\"1.1\"");
    expect(xml).toContain('lat="32.8"');
    expect(xml).toContain("lon=\"34.95\"");
    expect(xml).toContain("חוף הכרמל &amp; טבע");
  });

  it("exports a trail as a track with start, waypoints, end", () => {
    const xml = trailToGpx(trail);
    expect(xml).toContain("<trk>");
    expect(xml).toContain("trkpt");
    expect(xml).toContain('lat="33"');
    expect(xml).toContain('lat="33.05"');
    expect(xml).toContain('lat="33.1"');
  });

  it("exports a trip with place waypoints and trail tracks", () => {
    const trip = {
      id: "c0000001-0000-4000-8000-000000000001",
      name: "טיול דוגמה",
      short_description: "יום נעים",
      full_description: "תיאור",
      main_image: "",
      gallery_images: [],
      tags: [],
      created_by: "u1",
      status: "approved",
      total_duration_minutes: 180,
      total_distance_km: 5,
      estimated_price: 0,
      difficulty: "easy",
      accessibility: 3,
      region: "צפון",
      station_count: 2,
      views_count: 0,
      favorites_count: 0,
      avg_rating: 0,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    } satisfies Trip;

    const stations = [
      {
        id: "s1",
        trip_id: trip.id,
        order_index: 0,
        station_type: "place",
        place_id: place.id,
        trail_id: null,
      },
      {
        id: "s2",
        trip_id: trip.id,
        order_index: 1,
        station_type: "trail",
        place_id: null,
        trail_id: trail.id,
      },
    ] satisfies TripStation[];

    const xml = tripToGpx(trip, stations, [place], [trail]);
    expect(xml).toContain("1. חוף הכרמל");
    expect(xml).toContain("2. נחל דוגמה");
    expect(xml).toContain("<wpt");
    expect(xml).toContain("<trk>");
    expect(xml).toContain("מסלול:");
  });
});

describe("gpxFilename", () => {
  it("builds a safe .gpx filename", () => {
    expect(gpxFilename("נחל כזיב", "b0000001-xxxx")).toBe("נחל-כזיב.gpx");
    expect(gpxFilename('a/b:c', "abcdef12-xxxx")).toMatch(/\.gpx$/);
  });
});

describe("parseGpx / gpxImportToCreateTrailInput", () => {
  it("parses track points and metadata", () => {
    const xml = buildGpxDocument({
      name: "מסלול בדיקה",
      description: "תיאור מסלול לבדיקה",
      tracks: [
        {
          name: "track",
          points: [
            { lat: 32.8, lng: 34.95, name: "התחלה" },
            { lat: 32.81, lng: 34.96 },
            { lat: 32.82, lng: 34.97, name: "סיום" },
          ],
        },
      ],
    });

    const parsed = parseGpx(xml);
    expect(parsed.name).toBe("מסלול בדיקה");
    expect(parsed.tracks).toHaveLength(1);
    expect(parsed.tracks[0]?.points).toHaveLength(3);

    const input = gpxImportToCreateTrailInput(parsed);
    expect(input.name).toBe("מסלול בדיקה");
    expect(input.start_lat).toBe(32.8);
    expect(input.end_lat).toBe(32.82);
    expect(input.waypoints).toHaveLength(1);
    expect(input.length_km).toBeGreaterThan(0);
    expect(input.tags).toContain("הליכה");
  });

  it("falls back to waypoints when no track exists", () => {
    const xml = buildGpxDocument({
      name: "נקודות",
      waypoints: [
        { lat: 31.78, lng: 35.22, name: "א" },
        { lat: 31.79, lng: 35.23, name: "ב" },
      ],
    });

    const input = gpxImportToCreateTrailInput(parseGpx(xml));
    expect(input.start_lat).toBe(31.78);
    expect(input.end_lat).toBe(31.79);
    expect(input.region).toBe("ירושלים");
  });

  it("uses filename when metadata name is missing", () => {
    const xml = `<?xml version="1.0"?><gpx version="1.1"><trk><trkseg>
      <trkpt lat="32.1" lon="34.8"></trkpt><trkpt lat="32.2" lon="34.9"></trkpt>
    </trkseg></trk></gpx>`;
    const input = gpxImportToCreateTrailInput(parseGpx(xml), { fileName: "נחל-דוגמה.gpx" });
    expect(input.name).toBe("נחל-דוגמה");
  });

  it("rejects files without enough GPS points", () => {
    const xml = buildGpxDocument({ name: "ריק", waypoints: [] });
    expect(() => gpxImportToCreateTrailInput(parseGpx(xml))).toThrow(/מספיק נקודות/);
  });

  it("builds place input from a single waypoint", () => {
    const xml = placeToGpx(place);
    const input = gpxImportToCreatePlaceInput(parseGpx(xml));
    expect(input.name).toContain("חוף");
    expect(input.lat).toBe(32.8);
    expect(input.lng).toBe(34.95);
    expect(input.region).toBe("כרמל");
  });

  it("parses TravelIsrael trip stations from export format", () => {
    const trip = {
      id: "c0000001-0000-4000-8000-000000000001",
      name: "טיול דוגמה",
      short_description: "יום נעים",
      full_description: "תיאור",
      main_image: "",
      gallery_images: [],
      tags: [],
      created_by: "u1",
      status: "approved",
      total_duration_minutes: 180,
      total_distance_km: 5,
      estimated_price: 0,
      difficulty: "easy",
      accessibility: 3,
      region: "צפון",
      station_count: 2,
      views_count: 0,
      favorites_count: 0,
      avg_rating: 0,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    } satisfies Trip;

    const stations = [
      {
        id: "s1",
        trip_id: trip.id,
        order_index: 0,
        station_type: "place",
        place_id: place.id,
        trail_id: null,
      },
      {
        id: "s2",
        trip_id: trip.id,
        order_index: 1,
        station_type: "trail",
        place_id: null,
        trail_id: trail.id,
      },
    ] satisfies TripStation[];

    const xml = tripToGpx(trip, stations, [place], [trail]);
    expect(isTravelIsraelGpx(xml)).toBe(true);
    const parsed = parseTravelIsraelTripGpx(parseGpx(xml));
    expect(parsed.name).toBe("טיול דוגמה");
    expect(parsed.stations).toEqual([
      { order: 1, type: "place", name: "חוף הכרמל & טבע" },
      { order: 2, type: "trail", name: "נחל דוגמה" },
    ]);
  });
});
