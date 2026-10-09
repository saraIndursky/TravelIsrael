import type { Place, Trail, Trip, TripStation } from "@/types";
import type { GpxPoint } from "./gpx-parse";

export type {
  GpxPlaceImportPayload,
  GpxTrailImportPayload,
  ParsedGpx,
  ParsedGpxTrack,
  TravelIsraelTripImport,
  TravelIsraelTripStationImport,
} from "./gpx-parse";
export {
  gpxImportToCreatePlaceInput,
  gpxImportToCreateTrailInput,
  guessRegionFromCoords,
  isTravelIsraelGpx,
  parseGpx,
  parseTravelIsraelTripGpx,
  readGpxFile,
} from "./gpx-parse";
export type { GpxPoint } from "./gpx-parse";

export interface GpxTrack {
  name: string;
  points: GpxPoint[];
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function isValidCoord(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

function pointXml(tag: "wpt" | "trkpt", point: GpxPoint): string {
  const name = point.name?.trim()
    ? `\n    <name>${escapeXml(point.name.trim())}</name>`
    : "";
  const desc = point.description?.trim()
    ? `\n    <desc>${escapeXml(point.description.trim())}</desc>`
    : "";
  if (tag === "trkpt") {
    return `      <trkpt lat="${point.lat}" lon="${point.lng}">${name}${desc}\n      </trkpt>`;
  }
  return `  <wpt lat="${point.lat}" lon="${point.lng}">${name}${desc}\n  </wpt>`;
}

function trackXml(track: GpxTrack): string {
  const points = track.points
    .filter((p) => isValidCoord(p.lat, p.lng))
    .map((p) => pointXml("trkpt", p))
    .join("\n");
  if (!points) return "";
  return `  <trk>
    <name>${escapeXml(track.name)}</name>
    <trkseg>
${points}
    </trkseg>
  </trk>`;
}

/** Builds a GPX 1.1 document (UTF-8). No external dependencies. */
export function buildGpxDocument(input: {
  name: string;
  description?: string;
  waypoints?: GpxPoint[];
  tracks?: GpxTrack[];
}): string {
  const waypoints = (input.waypoints ?? [])
    .filter((p) => isValidCoord(p.lat, p.lng))
    .map((p) => pointXml("wpt", p))
    .join("\n");

  const tracks = (input.tracks ?? [])
    .map((t) => trackXml(t))
    .filter(Boolean)
    .join("\n");

  const desc = input.description?.trim()
    ? `\n    <desc>${escapeXml(input.description.trim())}</desc>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TravelIsrael" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escapeXml(input.name)}</name>${desc}
  </metadata>
${waypoints ? `${waypoints}\n` : ""}${tracks ? `${tracks}\n` : ""}</gpx>
`;
}

export function trailToGpxPoints(trail: Trail): GpxPoint[] {
  const points: GpxPoint[] = [
    { lat: trail.start_lat, lng: trail.start_lng, name: `${trail.name} — התחלה` },
  ];
  for (const wp of trail.waypoints ?? []) {
    if (!isValidCoord(wp.lat, wp.lng)) continue;
    points.push({ lat: wp.lat, lng: wp.lng, name: wp.name });
  }
  const last = points[points.length - 1];
  if (!last || last.lat !== trail.end_lat || last.lng !== trail.end_lng) {
    points.push({ lat: trail.end_lat, lng: trail.end_lng, name: `${trail.name} — סיום` });
  }
  return points;
}

export function placeToGpx(place: Place): string {
  return buildGpxDocument({
    name: place.name,
    description: place.short_description || place.full_description,
    waypoints: [
      {
        lat: place.lat,
        lng: place.lng,
        name: place.name,
        description: place.address || place.short_description,
      },
    ],
  });
}

export function trailToGpx(trail: Trail): string {
  return buildGpxDocument({
    name: trail.name,
    description: trail.short_description || trail.full_description,
    tracks: [{ name: trail.name, points: trailToGpxPoints(trail) }],
  });
}

export function tripToGpx(
  trip: Trip,
  stations: TripStation[],
  places: Place[],
  trails: Trail[]
): string {
  const sorted = [...stations].sort((a, b) => a.order_index - b.order_index);
  const waypoints: GpxPoint[] = [];
  const tracks: GpxTrack[] = [];
  const routePoints: GpxPoint[] = [];

  sorted.forEach((station, index) => {
    const order = index + 1;
    if (station.station_type === "place" && station.place_id) {
      const place = places.find((p) => p.id === station.place_id);
      if (!place || !isValidCoord(place.lat, place.lng)) return;
      const point: GpxPoint = {
        lat: place.lat,
        lng: place.lng,
        name: `${order}. ${place.name}`,
        description: place.short_description || place.address,
      };
      waypoints.push(point);
      routePoints.push(point);
      return;
    }

    if (station.station_type === "trail" && station.trail_id) {
      const trail = trails.find((t) => t.id === station.trail_id);
      if (!trail) return;
      const trailPoints = trailToGpxPoints(trail);
      tracks.push({
        name: `${order}. ${trail.name}`,
        points: trailPoints,
      });
      if (trailPoints[0]) {
        routePoints.push({
          lat: trailPoints[0].lat,
          lng: trailPoints[0].lng,
          name: `${order}. ${trail.name}`,
        });
      }
    }
  });

  if (routePoints.length >= 2) {
    tracks.unshift({ name: `מסלול: ${trip.name}`, points: routePoints });
  }

  return buildGpxDocument({
    name: trip.name,
    description: trip.short_description || trip.full_description,
    waypoints,
    tracks,
  });
}

export function gpxFilename(baseName: string, entityId: string): string {
  const safe = baseName
    .trim()
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
  const suffix = entityId.slice(0, 8);
  const stem = safe || `travel-israel-${suffix}`;
  return `${stem}.gpx`;
}

/** Triggers a browser file download. Client-only. */
export function downloadGpx(filename: string, content: string): void {
  if (typeof document === "undefined") {
    throw new Error("הורדת GPX זמינה רק בדפדפן");
  }
  const blob = new Blob([content], { type: "application/gpx+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".gpx") ? filename : `${filename}.gpx`;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
