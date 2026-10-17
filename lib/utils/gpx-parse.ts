import type { Accessibility, Difficulty, Region } from "@/types";
import { haversineKm } from "@/lib/utils/geo";

const NUMBERED_STATION_NAME = /^(\d+)\.\s*(.+)$/;
const MAX_IMPORT_WAYPOINTS = 40;
const MAX_GPX_FILE_BYTES = 5 * 1024 * 1024;

export interface GpxPoint {
  lat: number;
  lng: number;
  name?: string;
  description?: string;
}

export interface ParsedGpxTrack {
  name?: string;
  points: GpxPoint[];
}

export interface ParsedGpx {
  name?: string;
  description?: string;
  tracks: ParsedGpxTrack[];
  waypoints: GpxPoint[];
}

export interface TravelIsraelTripStationImport {
  order: number;
  type: "place" | "trail";
  name: string;
}

export interface TravelIsraelTripImport {
  name: string;
  description?: string;
  stations: TravelIsraelTripStationImport[];
}

export interface GpxPlaceImportPayload {
  name: string;
  short_description: string;
  full_description: string;
  address: string;
  lat: number;
  lng: number;
  region: Region;
  place_type: string;
  accessibility: Accessibility;
  tags: string[];
  avg_duration_minutes: number;
  estimated_price: number;
  opening_time?: string;
  closing_time?: string;
  phone?: string;
  website?: string;
  image_url: string;
}

export interface GpxTrailImportPayload {
  name: string;
  short_description: string;
  full_description: string;
  region: Region;
  trail_type: string;
  length_km: number;
  duration_minutes: number;
  difficulty: Difficulty;
  accessibility: Accessibility;
  tags: string[];
  estimated_price: number;
  operating_hours?: string;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  waypoints: { lat: number; lng: number; name?: string }[];
  image_url: string;
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

function unescapeXml(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&");
}

function parseCoord(value: string | undefined): number {
  if (!value) return Number.NaN;
  const n = Number.parseFloat(value.trim());
  return Number.isFinite(n) ? n : Number.NaN;
}

function extractTagBody(xml: string, tag: "trkpt" | "wpt"): GpxPoint[] {
  const points: GpxPoint[] = [];
  const blockRe = new RegExp(`<${tag}\\b([^>]*)>([\\s\\S]*?)<\\/${tag}>`, "gi");
  let match = blockRe.exec(xml);
  while (match) {
    const attrs = match[1] ?? "";
    const body = match[2] ?? "";
    const lat = parseCoord(attrs.match(/\blat=["']([^"']+)["']/i)?.[1]);
    const lng = parseCoord(attrs.match(/\blon=["']([^"']+)["']/i)?.[1]);
    if (isValidCoord(lat, lng)) {
      const name = body.match(/<name\b[^>]*>([\s\S]*?)<\/name>/i)?.[1]?.trim();
      const description = body.match(/<desc\b[^>]*>([\s\S]*?)<\/desc>/i)?.[1]?.trim();
      points.push({
        lat,
        lng,
        name: unescapeXml(name),
        description: unescapeXml(description),
      });
    }
    match = blockRe.exec(xml);
  }
  return points;
}

function extractBlockText(xml: string, blockTag: string, innerTag: string): string | undefined {
  const blockRe = new RegExp(`<${blockTag}\\b[^>]*>([\\s\\S]*?)<\\/${blockTag}>`, "i");
  const block = blockRe.exec(xml)?.[1];
  if (!block) return undefined;
  const innerRe = new RegExp(`<${innerTag}\\b[^>]*>([\\s\\S]*?)<\\/${innerTag}>`, "i");
  const raw = innerRe.exec(block)?.[1]?.trim();
  return raw ? unescapeXml(raw) : undefined;
}

function extractTracks(xml: string): ParsedGpxTrack[] {
  const tracks: ParsedGpxTrack[] = [];
  const trkRe = /<trk\b[^>]*>([\s\S]*?)<\/trk>/gi;
  let match = trkRe.exec(xml);
  while (match) {
    const body = match[1] ?? "";
    const points = extractTagBody(body, "trkpt");
    if (points.length === 0) {
      match = trkRe.exec(xml);
      continue;
    }
    const rawName = body.match(/<name\b[^>]*>([\s\S]*?)<\/name>/i)?.[1]?.trim();
    tracks.push({
      name: rawName ? unescapeXml(rawName) : undefined,
      points,
    });
    match = trkRe.exec(xml);
  }
  return tracks;
}

function trackLengthKm(points: GpxPoint[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineKm(points[i - 1], points[i]);
  }
  return Math.round(total * 10) / 10;
}

function subsamplePoints(points: GpxPoint[], max: number): GpxPoint[] {
  if (points.length <= max) return points;
  const step = Math.ceil(points.length / max);
  const result: GpxPoint[] = [];
  for (let i = 0; i < points.length; i += step) {
    result.push(points[i]);
  }
  return result;
}

function selectRoutePoints(parsed: ParsedGpx): GpxPoint[] {
  const itineraryTrack = parsed.tracks.find((track) => track.name?.startsWith("מסלול:"));
  const routeCandidates = parsed.tracks.filter((track) => !track.name?.startsWith("מסלול:"));
  const longestTrack = routeCandidates.reduce<GpxPoint[]>(
    (best, track) => (track.points.length > best.length ? track.points : best),
    itineraryTrack?.points ?? []
  );
  if (longestTrack.length >= 2) return longestTrack;
  if (longestTrack.length === 1) return longestTrack;
  if (parsed.waypoints.length >= 2) return parsed.waypoints;
  if (parsed.waypoints.length === 1) return parsed.waypoints;
  return [];
}

function selectPrimaryPoint(parsed: ParsedGpx): GpxPoint {
  if (parsed.waypoints.length > 0) return parsed.waypoints[0];
  const route = selectRoutePoints(parsed);
  if (route.length > 0) return route[0];
  throw new Error("קובץ GPX לא מכיל נקודת GPS");
}

/** Rough region guess from coordinates (Israel-focused). */
export function guessRegionFromCoords(lat: number, lng: number): Region {
  if (lat >= 29.5 && lat <= 30.15 && lng >= 34.9 && lng <= 35.6) return "אילת";
  if (lat >= 31.45 && lat <= 31.85 && lng >= 35.3 && lng <= 35.65) return "ים המלח";
  if (lat >= 33.05 && lng >= 35.45 && lng <= 35.85) return "גליל";
  if (lat >= 33.0) return "צפון";
  if (lat >= 32.55 && lat <= 32.95 && lng >= 34.85 && lng <= 35.15) return "כרמל";
  if (lat >= 31.65 && lat <= 31.9 && lng >= 35.05 && lng <= 35.35) return "ירושלים";
  if (lat >= 31.85 && lat <= 32.25 && lng >= 35.0 && lng <= 35.55) return "יהודה ושומרון";
  if (lat <= 31.35 && lng >= 34.2 && lng <= 35.05) return "נגב";
  if (lat >= 31.2 && lat <= 32.15 && lng >= 34.2 && lng <= 34.95) return "חוף";
  if (lat >= 31.85 && lat <= 32.25 && lng >= 34.75 && lng <= 35.05) return "מרכז";
  return "מרכז";
}

/** Parses GPX 1.x XML without external dependencies. */
export function parseGpx(xml: string): ParsedGpx {
  const trimmed = xml.trim();
  if (!trimmed.includes("<gpx") && !trimmed.includes(":gpx")) {
    throw new Error("קובץ GPX לא תקין");
  }
  if (trimmed.length > MAX_GPX_FILE_BYTES) {
    throw new Error("קובץ GPX גדול מדי (מקסימום 5MB)");
  }

  const metadataName = extractBlockText(trimmed, "metadata", "name");
  const metadataDesc = extractBlockText(trimmed, "metadata", "desc");
  const tracks = extractTracks(trimmed);

  return {
    name: metadataName ?? tracks.find((track) => track.name && !track.name.startsWith("מסלול:"))?.name,
    description: metadataDesc,
    tracks,
    waypoints: extractTagBody(trimmed, "wpt"),
  };
}

/** True when the file was exported by TravelIsrael (trip round-trip import). */
export function isTravelIsraelGpx(xml: string): boolean {
  return /creator=["']TravelIsrael["']/i.test(xml);
}

/** Parses numbered stations from a TravelIsrael trip GPX export. */
export function parseTravelIsraelTripGpx(parsed: ParsedGpx): TravelIsraelTripImport {
  const stations: TravelIsraelTripStationImport[] = [];

  for (const waypoint of parsed.waypoints) {
    const label = waypoint.name?.trim();
    if (!label) continue;
    const match = NUMBERED_STATION_NAME.exec(label);
    if (!match) continue;
    stations.push({
      order: Number.parseInt(match[1], 10),
      type: "place",
      name: match[2].trim(),
    });
  }

  for (const track of parsed.tracks) {
    const label = track.name?.trim();
    if (!label || label.startsWith("מסלול:")) continue;
    const match = NUMBERED_STATION_NAME.exec(label);
    if (!match) continue;
    stations.push({
      order: Number.parseInt(match[1], 10),
      type: "trail",
      name: match[2].trim(),
    });
  }

  if (stations.length === 0) {
    throw new Error("לא נמצאו תחנות בקובץ GPX");
  }

  stations.sort((a, b) => a.order - b.order);

  const orders = new Set<number>();
  for (const station of stations) {
    if (orders.has(station.order)) {
      throw new Error("מבנה התחנות בקובץ GPX כפול או לא תקין");
    }
    orders.add(station.order);
  }

  return {
    name: parsed.name?.trim() || "טיול GPX",
    description: parsed.description,
    stations,
  };
}

export function gpxImportToCreatePlaceInput(
  parsed: ParsedGpx,
  options?: { fileName?: string }
): GpxPlaceImportPayload {
  const point = selectPrimaryPoint(parsed);

  const rawName =
    point.name?.replace(NUMBERED_STATION_NAME, "$2").trim() ||
    parsed.name?.trim() ||
    options?.fileName?.replace(/\.gpx$/i, "").trim() ||
    "מקום GPX";

  const shortFromFile = (point.description ?? parsed.description)?.trim().slice(0, 500);
  const short_description =
    shortFromFile && shortFromFile.length >= 10
      ? shortFromFile
      : "מקום שיובא מקובץ GPX — יש להשלים תיאור קצר";

  const full_description =
    parsed.description?.trim() && parsed.description.trim().length >= 20
      ? parsed.description.trim()
      : "מקום שיובא מקובץ GPX. יש לערוך ולהשלים את כל הפרטים לפני שליחה לאישור.";

  const address =
    point.description?.trim() && point.description.trim().length >= 2
      ? point.description.trim()
      : "לא צוין";

  return {
    name: rawName.slice(0, 200),
    short_description,
    full_description,
    address,
    lat: point.lat,
    lng: point.lng,
    region: guessRegionFromCoords(point.lat, point.lng),
    place_type: "אחר",
    accessibility: 3,
    tags: ["טבע"],
    avg_duration_minutes: 60,
    estimated_price: 0,
    image_url: "",
  };
}

export function gpxImportToCreateTrailInput(
  parsed: ParsedGpx,
  options?: { fileName?: string }
): GpxTrailImportPayload {
  const route = selectRoutePoints(parsed);
  if (route.length === 0) {
    throw new Error("קובץ GPX לא מכיל מספיק נקודות GPS (track או waypoints)");
  }

  const start = route[0];
  const end = route[route.length - 1];
  const middle =
    route.length > 2 ? subsamplePoints(route.slice(1, -1), MAX_IMPORT_WAYPOINTS) : [];

  const length_km = Math.max(0.1, route.length >= 2 ? trackLengthKm(route) : 0.5);
  const duration_minutes = Math.max(15, Math.round((length_km / 4) * 60));

  const rawName =
    parsed.name?.trim() ||
    options?.fileName?.replace(/\.gpx$/i, "").trim() ||
    "מסלול GPX";

  const shortFromFile = parsed.description?.trim().slice(0, 500);
  const short_description =
    shortFromFile && shortFromFile.length >= 10
      ? shortFromFile
      : "מסלול שיובא מקובץ GPX — יש להשלים תיאור קצר";

  const full_description =
    parsed.description?.trim() && parsed.description.trim().length >= 20
      ? parsed.description.trim()
      : "מסלול שיובא מקובץ GPX. יש לערוך ולהשלים את כל הפרטים (אזור, קושי, תגיות ועוד) לפני שליחה לאישור.";

  return {
    name: rawName.slice(0, 200),
    short_description,
    full_description,
    region: guessRegionFromCoords(start.lat, start.lng),
    trail_type: "הליכה",
    length_km,
    duration_minutes,
    difficulty: "medium",
    accessibility: 3,
    tags: ["הליכה"],
    estimated_price: 0,
    start_lat: start.lat,
    start_lng: start.lng,
    end_lat: end.lat,
    end_lng: end.lng,
    waypoints: middle.map((point) => ({
      lat: point.lat,
      lng: point.lng,
      name: point.name,
    })),
    image_url: "",
  };
}

export function readGpxFile(file: File): Promise<string> {
  if (!file.name.toLowerCase().endsWith(".gpx") && file.type !== "application/gpx+xml") {
    return Promise.reject(new Error("יש לבחור קובץ GPX בלבד"));
  }
  if (file.size > MAX_GPX_FILE_BYTES) {
    return Promise.reject(new Error("קובץ GPX גדול מדי (מקסימום 5MB)"));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("לא ניתן לקרוא את הקובץ"));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => reject(new Error("שגיאה בקריאת הקובץ"));
    reader.readAsText(file, "UTF-8");
  });
}
