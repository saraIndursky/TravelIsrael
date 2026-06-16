import type { Place, Region, Trail } from "@/types";
import { REGIONS } from "@/types/enums";
import { seedPlaces } from "@/data/seed/places";
import { seedTrails } from "@/data/seed/trails";

const REGION_CENTERS: Record<Region, { lat: number; lng: number }> = {
  צפון: { lat: 32.9, lng: 35.3 },
  גליל: { lat: 32.96, lng: 35.5 },
  כרמל: { lat: 32.74, lng: 35.0 },
  מרכז: { lat: 32.08, lng: 34.78 },
  ירושלים: { lat: 31.77, lng: 35.23 },
  "יהודה ושומרון": { lat: 31.95, lng: 35.2 },
  נגב: { lat: 30.8, lng: 34.9 },
  אילת: { lat: 29.56, lng: 34.95 },
  "ים המלח": { lat: 31.5, lng: 35.4 },
  חוף: { lat: 32.07, lng: 34.76 },
};

function normalizeForMatch(s: string): string {
  return s.trim().toLowerCase().replace(/[^a-z0-9\u0590-\u05FF\s]/gi, "");
}

function scoreMatch(query: string, target: string): number {
  const q = normalizeForMatch(query);
  const t = normalizeForMatch(target);
  if (!q || !t) return 0;
  if (t.includes(q) || q.includes(t)) return 10;
  const qWords = q.split(/\s+/);
  let score = 0;
  for (const w of qWords) {
    if (w.length >= 2 && t.includes(w)) score += 3;
  }
  return score;
}

export function findSimilarPlace(name: string, address?: string): Place | null {
  const query = `${name} ${address ?? ""}`.trim();
  let best: Place | null = null;
  let bestScore = 0;
  for (const p of seedPlaces) {
    const score = scoreMatch(query, `${p.name} ${p.address}`);
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }
  return bestScore >= 3 ? best : null;
}

export function findSimilarTrail(name: string): Trail | null {
  let best: Trail | null = null;
  let bestScore = 0;
  for (const t of seedTrails) {
    const score = scoreMatch(name, t.name);
    if (score > bestScore) {
      bestScore = score;
      best = t;
    }
  }
  return bestScore >= 3 ? best : null;
}

export function inferRegionFromText(text: string): Region | null {
  const normalized = normalizeForMatch(text);
  if (!normalized) return null;

  const byLength = [...REGIONS].sort((a, b) => b.length - a.length);
  for (const region of byLength) {
    if (normalized.includes(normalizeForMatch(region))) return region;
  }
  if (normalized.includes("מצדה") || /עין\s*גדי/.test(normalized)) return "ים המלח";
  if (normalized.includes("תלאביב") || normalized.includes("אביב")) return "מרכז";
  return null;
}

export type TrailMatchSource = "seed" | "name_region" | "selected_region" | "fallback";

export function describeRegionSource(
  source: TrailMatchSource,
  matchName?: string,
  region?: string
): string {
  switch (source) {
    case "seed":
      return `האזור והקואורדינטות מועתקים ממסלול דומה בנתוני הדמו: «${matchName ?? ""}».`;
    case "name_region":
      return `האזור «${region ?? ""}» זוהה משם המסלול (לא התאמה מלאה בדמו).`;
    case "selected_region":
      return `האזור «${region ?? ""}» כבר בטופס — הקואורדינטות ממרכז האזור (הערכה, לא מדויק).`;
    default:
      return "לא מצאתי התאמה בדמו — אזור וקואורדינטות הם הערכה כללית. מומלץ לוודא במפה.";
  }
}

export function getRegionCenter(region: string): { lat: number; lng: number } {
  return REGION_CENTERS[region as Region] ?? REGION_CENTERS["מרכז"];
}
