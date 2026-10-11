import type { Place } from "@/types";
import { formatDuration, formatPrice, getAccessibilityLabel } from "@/lib/utils";

export interface PlaceTip {
  type: "warning" | "time" | "budget" | "parking" | "season" | "food";
  text: string;
}

/** Only the place's own photo; community uploads are merged in by the gallery. */
export function getPlaceGalleryImages(place: Place): string[] {
  return place.image_url ? [place.image_url] : [];
}

export function getPlaceAudienceLabel(place: Place): string {
  if (place.tags.includes("משפחות")) return "משפחות, זוגות";
  if (place.tags.includes("ספורט")) return "ספורטאים, חובבי פעילות";
  if (place.place_type.includes("מסעד") || place.tags.includes("אוכל")) return "משפחות, זוגות";
  return "כל המשפחה";
}

export function formatPlaceOpeningHours(place: Place): string {
  if (place.opening_time && place.closing_time) {
    return `${place.opening_time}–${place.closing_time}`;
  }
  return "לא צוין";
}

export function getPlaceFeatures(place: Place): string[] {
  const features: string[] = [];

  if (place.accessibility >= 4) features.push("נגישות גבוהה");
  else if (place.accessibility >= 2) features.push("נגישות חלקית");
  if (place.estimated_price === 0) features.push("כניסה חינם");
  if (place.phone) features.push("ניתן לייצירת קשר טלפוני");
  if (place.website) features.push("אתר אינטרנט זמין");
  if (place.tags.includes("חינם")) features.push("ללא עלות כניסה");
  if (place.tags.includes("ים") || place.tags.includes("חוף")) features.push("קרוב לים");
  if (place.tags.includes("היסטוריה")) features.push("ערך היסטורי");
  if (place.tags.includes("תרבות")) features.push("חוויה תרבותית");

  for (const tag of place.tags.slice(0, 3)) {
    if (!features.some((f) => f.includes(tag))) {
      features.push(`מתאים ל: ${tag}`);
    }
  }

  if (features.length === 0) {
    features.push(`סוג מקום: ${place.place_type}`, `אזור: ${place.region}`);
  }

  return features.slice(0, 6);
}

export function getPlaceTips(place: Place): PlaceTip[] {
  const tips: PlaceTip[] = [];

  tips.push({
    type: "time",
    text: `משך ביקור מומלץ: ${formatDuration(place.avg_duration_minutes)}`,
  });

  if (place.estimated_price > 0) {
    tips.push({
      type: "budget",
      text: `עלות משוערת: ${formatPrice(place.estimated_price)}`,
    });
  } else {
    tips.push({ type: "budget", text: "כניסה חינם — ללא עלות" });
  }

  if (place.opening_time && place.closing_time) {
    tips.push({
      type: "time",
      text: `שעות פתיחה: ${place.opening_time}–${place.closing_time}`,
    });
  }

  if (place.accessibility <= 2) {
    tips.push({
      type: "warning",
      text: `נגישות מוגבלת (${getAccessibilityLabel(place.accessibility)}) — מומלץ לתאם מראש`,
    });
  }

  if (place.region === "גליל" || place.region === "כרמל") {
    tips.push({ type: "season", text: "הכי נעים באביב ובסתיו" });
  }
  if (place.region === "נגב" || place.region === "ים המלח") {
    tips.push({ type: "season", text: "הימנעו משעות הצהריים החמות בקיץ" });
  }

  if (place.tags.includes("חוף") || place.tags.includes("ים")) {
    tips.push({ type: "parking", text: "חניה מוגבלת בסופי שבוע — הגיעו מוקדם" });
  }

  if (place.place_type.includes("מסעד") || place.tags.includes("אוכל")) {
    tips.push({ type: "food", text: "מומלץ להזמין מקום מראש בסופי שבוע" });
  }

  return tips;
}

export function getNavigationUrl(place: Place): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
}
