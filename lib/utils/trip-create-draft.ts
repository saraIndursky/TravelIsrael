import type { TripStation } from "@/types";
import type { TripFormValues } from "@/lib/validations";

const DRAFT_KEY = "travelisrael:trip-create-draft";

export interface TripCreateDraft {
  form: TripFormValues;
  stations: TripStation[];
  startTime: string;
  imagePreview: string;
  returnPath: string;
}

export function sanitizeReturnPath(path: string | null): string | null {
  if (!path) return null;
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  if (path === "/trips/create") return path;
  if (/^\/trips\/[^/]+\/edit$/.test(path)) return path;
  return null;
}

export function saveTripCreateDraft(draft: TripCreateDraft): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function loadTripCreateDraft(): TripCreateDraft | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TripCreateDraft;
  } catch {
    return null;
  }
}

export function clearTripCreateDraft(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(DRAFT_KEY);
}

export function parseAddStationParam(
  value: string | null
): { type: "place" | "trail"; id: string } | null {
  if (!value) return null;
  const match = value.match(/^(place|trail):([a-zA-Z0-9-]+)$/);
  if (!match) return null;
  return { type: match[1] as "place" | "trail", id: match[2] };
}

export function buildCreateEntityUrl(
  entity: "place" | "trail",
  returnPath: string
): string {
  const base = entity === "place" ? "/places/create" : "/trails/create";
  return `${base}?returnTo=${encodeURIComponent(returnPath)}`;
}

export function buildTripReturnUrl(
  returnPath: string,
  station: { type: "place" | "trail"; id: string }
): string {
  const params = new URLSearchParams();
  params.set("addStation", `${station.type}:${station.id}`);
  return `${returnPath}?${params.toString()}`;
}

export function readAddStationFromLocation(): {
  type: "place" | "trail";
  id: string;
} | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return parseAddStationParam(params.get("addStation"));
}
