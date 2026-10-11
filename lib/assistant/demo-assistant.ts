import type {
  AssistantContext,
  AssistantEntity,
  AssistantFieldUpdate,
  AssistantMessage,
  AssistantResponse,
  QuickActionId,
} from "@/types/assistant";
import { COMMON_TAGS } from "@/types/enums";
import type { Accessibility } from "@/types";
import { getFieldLabel } from "./field-labels";
import {
  formatUpdatesSummary,
  getDefaultTripImage,
  scanMissingFieldsMessage,
  suggestTripShortDescription,
} from "./format-update-preview";
import { isOffTopicMessage, offTopicResponse } from "./scope-guard";
import {
  describeRegionSource,
  findSimilarPlace,
  findSimilarTrail,
  getRegionCenter,
  inferRegionFromText,
  type TrailMatchSource,
} from "./seed-lookup";

function str(v: unknown): string {
  if (typeof v === "string") return v.trim();
  if (v == null) return "";
  return String(v).trim();
}

function num(v: unknown): number | undefined {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
}

function isEmpty(v: unknown): boolean {
  if (v == null) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

function lastUserMessage(messages: AssistantMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return messages[i].content;
  }
  return "";
}

function matches(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

const FIELD_HELP_PATTERNS = [
  /שדות חסר/,
  /חסרים/,
  /מלא שדות|מילוי שדות/,
  /כל השדות/,
  /עזרה.*שדות/,
  /שדות.*עזרה/,
  /עזרה עם/,
  /עזרה אם/,
  /כתבתי.*שם/,
  /השלם/,
  /להשלים/,
  /למלא/,
  /תעזור/,
  /תעזרי/,
  /אשמח לעזרה/,
  /רוצה עזרה/,
];

function wantsHelpWithFields(text: string, action?: QuickActionId): boolean {
  if (action === "fill_missing") return true;
  if (matches(text, FIELD_HELP_PATTERNS)) return true;
  if (/עזרה/.test(text) && /שדות|שדה|טופס/.test(text)) return true;
  return false;
}

function pushIfEmpty(
  updates: AssistantFieldUpdate[],
  snapshot: Record<string, unknown>,
  field: string,
  value: unknown,
  entity: "place" | "trail" | "trip"
): void {
  if (!isEmpty(snapshot[field]) || isEmpty(value)) return;
  updates.push({ field, value, label: getFieldLabel(entity, field) });
}

function inferTrailTypeFromName(name: string): string {
  const n = normalizeTrailName(name);
  if (/מים|נחל|בריכ/.test(n)) return "מים";
  if (/טיפוס|שביל הנחש|מצדה/.test(n)) return "טיפוס";
  if (/אופניים/.test(n)) return "אופניים";
  if (/רכיבה|סוס/.test(n)) return "רכיבה";
  return "הליכה";
}

function normalizeTrailName(name: string): string {
  return name.trim().toLowerCase();
}

function buildTrailFillUpdates(snapshot: Record<string, unknown>): {
  updates: AssistantFieldUpdate[];
  message: string;
} {
  const name = str(snapshot.name);
  const shortDesc = str(snapshot.short_description);
  const trailType = str(snapshot.trail_type);
  const region = str(snapshot.region);
  const difficulty = str(snapshot.difficulty);
  const tags = (snapshot.tags as string[]) ?? [];
  const updates: AssistantFieldUpdate[] = [];

  if (!name) {
    return {
      updates: [],
      message: "הזינו שם מסלול בטופס — ואז אוכל להציע עזרה לכל השדות.",
    };
  }

  const match = findSimilarTrail(name);
  let regionSource: TrailMatchSource = "fallback";
  let regionNote = "";

  if (match) {
    regionSource = "seed";
    regionNote = describeRegionSource("seed", match.name);
    pushIfEmpty(updates, snapshot, "short_description", match.short_description, "trail");
    pushIfEmpty(updates, snapshot, "full_description", match.full_description, "trail");
    pushIfEmpty(updates, snapshot, "region", match.region, "trail");
    pushIfEmpty(updates, snapshot, "trail_type", match.trail_type, "trail");
    pushIfEmpty(updates, snapshot, "length_km", match.length_km, "trail");
    pushIfEmpty(updates, snapshot, "duration_minutes", match.duration_minutes, "trail");
    pushIfEmpty(updates, snapshot, "difficulty", match.difficulty, "trail");
    pushIfEmpty(updates, snapshot, "accessibility", match.accessibility, "trail");
    pushIfEmpty(updates, snapshot, "estimated_price", match.estimated_price, "trail");
    pushIfEmpty(updates, snapshot, "start_lat", match.start_lat, "trail");
    pushIfEmpty(updates, snapshot, "start_lng", match.start_lng, "trail");
    pushIfEmpty(updates, snapshot, "end_lat", match.end_lat, "trail");
    pushIfEmpty(updates, snapshot, "end_lng", match.end_lng, "trail");
    if (match.waypoints?.length) {
      pushIfEmpty(updates, snapshot, "waypoints", match.waypoints, "trail");
    }
    if (match.tags?.length) {
      pushIfEmpty(
        updates,
        snapshot,
        "tags",
        Array.from(new Set([...tags, ...match.tags])),
        "trail"
      );
    }
  } else {
    const inferredRegion = inferRegionFromText(name);
    const inferredType = inferTrailTypeFromName(name);
    const effectiveRegion = region || inferredRegion || "";

    if (inferredRegion && isEmpty(snapshot.region)) {
      regionSource = "name_region";
      pushIfEmpty(updates, snapshot, "region", inferredRegion, "trail");
      regionNote = describeRegionSource("name_region", undefined, inferredRegion);
    } else if (region) {
      regionSource = "selected_region";
      regionNote = describeRegionSource("selected_region", undefined, region);
    } else {
      regionNote = describeRegionSource("fallback");
    }

    if (isEmpty(snapshot.short_description)) {
      pushIfEmpty(
        updates,
        snapshot,
        "short_description",
        shortDesc || `מסלול ${name} — חוויה בטבע בישראל`,
        "trail"
      );
    }
    pushIfEmpty(updates, snapshot, "trail_type", inferredType, "trail");
    pushIfEmpty(updates, snapshot, "difficulty", "medium", "trail");
    pushIfEmpty(
      updates,
      snapshot,
      "accessibility",
      suggestAccessibilityForTrail(inferredType, difficulty || "medium"),
      "trail"
    );

    const lengthKm = num(snapshot.length_km) ?? 5;
    pushIfEmpty(updates, snapshot, "length_km", lengthKm, "trail");
    pushIfEmpty(
      updates,
      snapshot,
      "duration_minutes",
      Math.round(lengthKm * 20 + 30),
      "trail"
    );
    pushIfEmpty(
      updates,
      snapshot,
      "estimated_price",
      inferredType === "מים" ? 29 : 0,
      "trail"
    );

    const center = getRegionCenter(effectiveRegion || "מרכז");
    pushIfEmpty(updates, snapshot, "start_lat", center.lat, "trail");
    pushIfEmpty(updates, snapshot, "start_lng", center.lng, "trail");
    pushIfEmpty(updates, snapshot, "end_lat", center.lat + 0.02, "trail");
    pushIfEmpty(updates, snapshot, "end_lng", center.lng + 0.02, "trail");

    const suggestedTags = suggestTags("trail", inferredType, effectiveRegion, tags);
    if (suggestedTags.length > 0) {
      pushIfEmpty(
        updates,
        snapshot,
        "tags",
        Array.from(new Set([...tags, ...suggestedTags])),
        "trail"
      );
    }
  }

  if (isEmpty(snapshot.full_description)) {
    const full = expandFullDescription(
      name,
      shortDesc || str(updates.find((u) => u.field === "short_description")?.value),
      trailType || inferTrailTypeFromName(name),
      region || inferRegionFromText(name) || ""
    );
    pushIfEmpty(updates, snapshot, "full_description", full, "trail");
  }

  const missing = scanMissingTrailFields(snapshot);
  const stillMissing = missing.filter(
    (m) => !updates.some((u) => u.field === m.field)
  );

  const parts = [
    `בסיס: שם המסלול «${name}».`,
    regionNote || describeRegionSource(regionSource),
  ];

  if (updates.length > 0) {
    parts.push(
      `הצעתי ${updates.length} שדות — לחצו על «אישור והחלה על הטופס» לפני השליחה.`
    );
  } else if (stillMissing.length === 0) {
    parts.push("כל השדות העיקריים כבר מלאים.");
  } else {
    parts.push(`שדות שעדיין חסרים: ${stillMissing.map((m) => m.label).join(", ")}.`);
  }

  return { updates, message: parts.join(" ") };
}

function buildPlaceFillUpdates(snapshot: Record<string, unknown>): {
  updates: AssistantFieldUpdate[];
  message: string;
} {
  const name = str(snapshot.name);
  const updates: AssistantFieldUpdate[] = [];

  if (!name) {
    return {
      updates: [],
      message: "הזינו שם מקום בטופס — ואז אוכל להציע עזרה לכל השדות.",
    };
  }

  const address = str(snapshot.address);
  const placeType = str(snapshot.place_type);
  const region = str(snapshot.region);
  const tags = (snapshot.tags as string[]) ?? [];
  const match = findSimilarPlace(name, address);

  let regionNote = "";
  if (match) {
    regionNote = describeRegionSource("seed", match.name);
    pushIfEmpty(updates, snapshot, "short_description", match.short_description, "place");
    pushIfEmpty(updates, snapshot, "full_description", match.full_description, "place");
    pushIfEmpty(updates, snapshot, "address", match.address, "place");
    pushIfEmpty(updates, snapshot, "lat", match.lat, "place");
    pushIfEmpty(updates, snapshot, "lng", match.lng, "place");
    pushIfEmpty(updates, snapshot, "region", match.region, "place");
    pushIfEmpty(updates, snapshot, "place_type", match.place_type, "place");
    pushIfEmpty(updates, snapshot, "accessibility", match.accessibility, "place");
    pushIfEmpty(updates, snapshot, "avg_duration_minutes", match.avg_duration_minutes, "place");
    pushIfEmpty(updates, snapshot, "estimated_price", match.estimated_price, "place");
    if (match.tags?.length) {
      pushIfEmpty(
        updates,
        snapshot,
        "tags",
        Array.from(new Set([...tags, ...match.tags])),
        "place"
      );
    }
  } else {
    const inferredRegion = inferRegionFromText(`${name} ${address}`);
    if (inferredRegion && isEmpty(snapshot.region)) {
      pushIfEmpty(updates, snapshot, "region", inferredRegion, "place");
      regionNote = describeRegionSource("name_region", undefined, inferredRegion);
    } else if (region) {
      regionNote = describeRegionSource("selected_region", undefined, region);
    } else {
      regionNote = describeRegionSource("fallback");
    }

    const center = getRegionCenter(region || inferredRegion || "מרכז");
    pushIfEmpty(updates, snapshot, "lat", center.lat, "place");
    pushIfEmpty(updates, snapshot, "lng", center.lng, "place");
    pushIfEmpty(
      updates,
      snapshot,
      "accessibility",
      suggestAccessibilityForPlace(placeType, tags),
      "place"
    );
    pushIfEmpty(
      updates,
      snapshot,
      "avg_duration_minutes",
      estimatePlaceDuration(placeType),
      "place"
    );
    pushIfEmpty(
      updates,
      snapshot,
      "estimated_price",
      estimatePlacePrice(placeType),
      "place"
    );
    const suggestedTags = suggestTags("place", placeType, region, tags);
    if (suggestedTags.length > 0) {
      pushIfEmpty(
        updates,
        snapshot,
        "tags",
        Array.from(new Set([...tags, ...suggestedTags])),
        "place"
      );
    }
  }

  if (isEmpty(snapshot.full_description)) {
    pushIfEmpty(
      updates,
      snapshot,
      "full_description",
      expandFullDescription(name, str(snapshot.short_description), placeType, region),
      "place"
    );
  }

  const message = [
    `בסיס: שם המקום «${name}».`,
    regionNote,
    updates.length > 0
      ? `הצעתי ${updates.length} שדות — אשרי לפני החלה.`
      : "כל השדות העיקריים כבר מלאים.",
  ].join(" ");

  return { updates, message };
}

function expandFullDescription(
  name: string,
  shortDesc: string,
  typeLabel: string,
  region: string
): string {
  const intro =
    shortDesc ||
    `${name} הוא ${typeLabel || "מקום"} מומלץ באזור ${region || "ישראל"}.`;
  const sections = [
    intro,
    `\n\nמה מחכה לכם:\nביקור ב${name} מציע חוויה ייחודית — ${typeLabel ? `כ${typeLabel}` : "מקום מעניין"} עם אווירה מקומית ואפשרויות לכל המשפחה.`,
    `\n\nטיפים לביקור:\n• מומלץ להגיע בשעות הבוקר או לפני שקיעה לתנאים נוחים.\n• בדקו שעות פתיחה ומחיר כניסה לפני הנסיעה.\n• שמרו על הסביבה ועלו רק במסלולים המסומנים.`,
  ];
  return sections.join("");
}

function suggestAccessibilityForPlace(placeType: string, tags: string[]): Accessibility {
  if (tags.includes("נגיש") || placeType === "מרכז קניות") return 4;
  if (placeType === "חוף" || placeType === "גן לאומי" || tags.includes("הליכה")) return 2;
  if (placeType === "מוזיאון" || placeType === "אתר מורשת") return 4;
  if (placeType === "מערה" || tags.includes("קמפינג")) return 2;
  return 3;
}

function suggestAccessibilityForTrail(trailType: string, difficulty: string): Accessibility {
  if (trailType === "מים" || difficulty === "hard") return 2;
  if (trailType === "הליכה" && difficulty === "easy") return 3;
  if (trailType === "רכיבה") return 2;
  return 3;
}

function suggestTags(
  entity: AssistantEntity,
  typeLabel: string,
  region: string,
  existing: string[]
): string[] {
  const pool = [...COMMON_TAGS];
  const scored = pool.map((tag) => {
    let score = 0;
    if (existing.includes(tag)) score -= 5;
    if (typeLabel.includes("חוף") && (tag === "ים" || tag === "משפחות")) score += 3;
    if (typeLabel.includes("מוזיאון") && (tag === "תרבות" || tag === "היסטוריה")) score += 3;
    if (typeLabel.includes("הליכה") || typeLabel === "הליכה") score += 2;
    if (typeLabel.includes("מים")) score += 3;
    if (region.includes("נגב") || region.includes("מדבר")) score += 2;
    if (region.includes("גליל") || region.includes("צפון")) score += 1;
    if (entity === "trip") score += 1;
    return { tag, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const picked = scored.filter((s) => !existing.includes(s.tag)).slice(0, 5).map((s) => s.tag);
  return picked.length >= 3 ? picked.slice(0, 5) : [...picked, ...pool.filter((t) => !existing.includes(t))].slice(0, 4);
}

function interpolateWaypoints(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  count: number
): Array<{ lat: number; lng: number; name: string }> {
  const points: Array<{ lat: number; lng: number; name: string }> = [];
  for (let i = 1; i <= count; i++) {
    const t = i / (count + 1);
    points.push({
      lat: Number((startLat + (endLat - startLat) * t).toFixed(5)),
      lng: Number((startLng + (endLng - startLng) * t).toFixed(5)),
      name: `נקודה ${i}`,
    });
  }
  return points;
}

function estimatePlaceDuration(placeType: string): number {
  if (placeType === "גן לאומי" || placeType === "פארק") return 120;
  if (placeType === "מוזיאון" || placeType === "אתר מורשת") return 90;
  if (placeType === "חוף") return 180;
  if (placeType === "שוק" || placeType === "מרכז קניות") return 60;
  return 60;
}

function estimatePlacePrice(placeType: string): number {
  if (placeType === "חוף" || placeType === "פארק") return 0;
  if (placeType === "גן לאומי") return 29;
  if (placeType === "מוזיאון") return 45;
  if (placeType === "אתר מורשת") return 35;
  return 0;
}

interface MissingField {
  field: string;
  label: string;
  suggestion?: unknown;
}

function scanMissingPlaceFields(snapshot: Record<string, unknown>): MissingField[] {
  const checks: Array<{ field: string; suggestion?: unknown }> = [
    { field: "full_description" },
    { field: "address" },
    { field: "region" },
    { field: "place_type" },
    { field: "tags" },
    { field: "opening_time" },
    { field: "closing_time" },
    { field: "phone" },
    { field: "website" },
    { field: "image_url" },
  ];
  const missing: MissingField[] = [];
  for (const { field } of checks) {
    if (isEmpty(snapshot[field])) {
      missing.push({ field, label: getFieldLabel("place", field) });
    }
  }
  return missing;
}

function scanMissingTrailFields(snapshot: Record<string, unknown>): MissingField[] {
  const checks = [
    "full_description",
    "region",
    "trail_type",
    "length_km",
    "duration_minutes",
    "difficulty",
    "tags",
    "operating_hours",
    "image_url",
  ];
  return checks
    .filter((field) => isEmpty(snapshot[field]))
    .map((field) => ({ field, label: getFieldLabel("trail", field) }));
}

function scanMissingTripFields(snapshot: Record<string, unknown>): MissingField[] {
  const checks = [
    "name",
    "short_description",
    "full_description",
    "tags",
    "main_image",
  ];
  return checks
    .filter((field) => isEmpty(snapshot[field]))
    .map((field) => ({ field, label: getFieldLabel("trip", field) }));
}

function wantsFillFromAction(action?: QuickActionId): boolean {
  return action === "fill_missing";
}

function isTripMissingQuery(text: string, action?: QuickActionId): boolean {
  if (wantsFillFromAction(action)) return false;
  return matches(text, [
    /שדות.*חסר/,
    /מה.*חסר/,
    /מה עוד/,
    /עוד.*חסר/,
    /חסר(?:ים)?/,
    /לא מלא/,
    /מה.*(צריך|נותר)/,
  ]);
}

function isTripShortDescriptionRequest(text: string, action?: QuickActionId): boolean {
  if (action === "short_description") return true;
  return matches(text, [
    /תיאור קצר/,
    /תיאור לכרטיס/,
    /שור[הא].*תיאור/,
    /תיאור.*שור[הא]/,
    /תכניס.*תיאור קצר/,
    /הכנס.*תיאור קצר/,
    /(?:תכניס|הכנס).*תיאור(?=\s*קצר)/,
  ]);
}

function isTripFullDescriptionRequest(text: string, action?: QuickActionId): boolean {
  if (action === "full_description") return true;
  if (isTripShortDescriptionRequest(text)) return false;
  return matches(text, [
    /תיאור מלא/,
    /מלא תיאור/,
    /הרחב/,
    /תוסיפ.*תיאור/,
    /תוסף.*תיאור/,
    /כתוב.*תיאור/,
    /עזור.*תיאור/,
  ]);
}

function buildTripFieldSuggestions(
  snapshot: Record<string, unknown>,
  missing: MissingField[]
): AssistantFieldUpdate[] {
  const name = str(snapshot.name);
  const shortDesc = str(snapshot.short_description);
  const fullDesc = str(snapshot.full_description);
  const tags = (snapshot.tags as string[]) ?? [];
  const updates: AssistantFieldUpdate[] = [];

  if (!name) return updates;

  if (missing.some((m) => m.field === "short_description")) {
    updates.push({
      field: "short_description",
      value: suggestTripShortDescription(name, fullDesc, tags),
      label: getFieldLabel("trip", "short_description"),
    });
  }
  if (missing.some((m) => m.field === "full_description")) {
    updates.push({
      field: "full_description",
      value: expandFullDescription(name, shortDesc, "טיול", ""),
      label: getFieldLabel("trip", "full_description"),
    });
  }
  if (missing.some((m) => m.field === "tags")) {
    const suggested = suggestTags("trip", "", "", tags);
    updates.push({
      field: "tags",
      value: Array.from(new Set([...tags, ...suggested])),
      label: getFieldLabel("trip", "tags"),
    });
  }
  if (missing.some((m) => m.field === "main_image")) {
    updates.push({
      field: "main_image",
      value: getDefaultTripImage(),
      label: getFieldLabel("trip", "main_image"),
    });
  }

  return updates;
}

function buildTripMissingReply(
  snapshot: Record<string, unknown>,
  stationCount: number,
  withSuggestions: boolean
): AssistantResponse {
  const missing = scanMissingTripFields(snapshot);
  const name = str(snapshot.name);

  if (missing.length === 0) {
    if (stationCount === 0) {
      return {
        message:
          "כל השדות בטופס מלאים — אבל עדיין אין תחנות במסלול. לחצו על «הוספת תחנה» כדי לבנות את הטיול.",
      };
    }
    return { message: "כל השדות העיקריים של הטיול מלאים." };
  }

  const intro = scanMissingFieldsMessage(
    "trip",
    missing.map((m) => m.label)
  );
  const stationNote =
    stationCount === 0 ? "\n\nשימי לב: עדיין אין תחנות במסלול." : "";

  if (!withSuggestions || !name) {
    return {
      message: name
        ? `${intro}${stationNote}\n\nכתבו «מילוי שדות חסרים» כדי שאציע תוכן.`
        : `${intro} הזינו שם טיול כדי שאוכל להציע תוכן.${stationNote}`,
    };
  }

  const updates = buildTripFieldSuggestions(snapshot, missing);
  if (updates.length === 0) {
    return { message: `${intro}${stationNote}` };
  }

  return {
    message: `${intro}\n\nהצעות:${formatUpdatesSummary(updates)}${stationNote}\n\nלחצו על «אישור והחלה על הטופס» כדי להחיל.`,
    updates,
  };
}

function helpMessage(
  entity: AssistantEntity,
  snapshot?: Record<string, unknown>
): AssistantResponse {
  const entityName =
    entity === "place" ? "מקום" : entity === "trail" ? "מסלול" : "טיול";

  if (entity === "trip" && snapshot) {
    const missing = scanMissingTripFields(snapshot);
    if (missing.length > 0) {
      const list = missing.map((m) => m.label).join(", ");
      return {
        message: `אפשר לעזור עם: תיאור קצר, תיאור מלא, תגיות, תמונה, או מילוי כל השדות החסרים. כרגע חסר: ${list}. כתבו למשל «הכניסו תיאור קצר» או «מילוי שדות חסרים».`,
      };
    }
  }

  return {
    message: `שלום! אני עוזר (דמו) ליצירת ${entityName}. כתבו מה צריך — למשל «תוסיפו תיאור מלא» או «מה חסר?» — בלי חובה להשתמש בכפתורים.`,
  };
}

function handlePlace(
  text: string,
  snapshot: Record<string, unknown>,
  context: AssistantContext,
  action?: QuickActionId
): AssistantResponse {
  const name = str(snapshot.name);
  const shortDesc = str(snapshot.short_description);
  const placeType = str(snapshot.place_type);
  const region = str(snapshot.region);
  const tags = (snapshot.tags as string[]) ?? [];
  const updates: AssistantFieldUpdate[] = [];

  const wantsFull =
    action === "full_description" ||
    matches(text, [/תיאור מלא/, /מלא תיאור/, /הרחב/]);
  const wantsAccess =
    action === "accessibility" || matches(text, [/נגישות/, /accessible/i]);
  const wantsCoords =
    action === "coordinates" ||
    matches(text, [/קואורדינט/, /מיקום/, /\blat\b/, /\blng\b/, /כתובת/]);
  const wantsTags = action === "tags" || matches(text, [/תגית/, /תגיות/]);
  const wantsDurationPrice =
    action === "duration_price" || matches(text, [/משך/, /מחיר/, /זמן ביקור/]);
  const wantsFill = wantsHelpWithFields(text, action);

  if (wantsFill) {
    const result = buildPlaceFillUpdates(snapshot);
    return {
      message: result.message,
      updates: result.updates.length > 0 ? result.updates : undefined,
    };
  }

  if (wantsFull) {
    if (!name) {
      return { message: "הזינו שם מקום קודם — ואז אוכל להרחיב תיאור מלא." };
    }
    const full = expandFullDescription(name, shortDesc, placeType, region);
    updates.push({
      field: "full_description",
      value: full,
      label: getFieldLabel("place", "full_description"),
    });
    return {
      message: "הרחבתי את התיאור המלא על בסיס השם והתיאור הקצר. בדקי וערכי לפני השליחה.",
      updates,
    };
  }

  if (wantsAccess) {
    const acc = suggestAccessibilityForPlace(placeType, tags);
    updates.push({
      field: "accessibility",
      value: acc,
      label: getFieldLabel("place", "accessibility"),
    });
    return {
      message: `הצעתי נגישות ${acc} (1=מאתגר, 5=נגיש מאוד) לפי סוג המקום והתגיות.`,
      updates,
    };
  }

  if (wantsCoords) {
    const address = str(snapshot.address);
    const match = findSimilarPlace(name, address);
    if (match) {
      updates.push(
        { field: "lat", value: match.lat, label: getFieldLabel("place", "lat") },
        { field: "lng", value: match.lng, label: getFieldLabel("place", "lng") }
      );
      if (isEmpty(snapshot.region)) {
        updates.push({
          field: "region",
          value: match.region,
          label: getFieldLabel("place", "region"),
        });
      }
      return {
        message: `מצאתי התאמה בנתוני הדמו: «${match.name}». מומלץ לוודא במפה לפני השליחה.`,
        updates,
      };
    }
    const center = getRegionCenter(region || "מרכז");
    updates.push(
      { field: "lat", value: center.lat, label: getFieldLabel("place", "lat") },
      { field: "lng", value: center.lng, label: getFieldLabel("place", "lng") }
    );
    return {
      message: `לא מצאתי התאמה מדויקת — הצעתי מרכז אזור ${region || "מרכז"}. מומלץ לוודא במפה.`,
      updates,
    };
  }

  if (wantsTags) {
    const suggested = suggestTags("place", placeType, region, tags);
    updates.push({
      field: "tags",
      value: Array.from(new Set([...tags, ...suggested])),
      label: getFieldLabel("place", "tags"),
    });
    return {
      message: `הצעתי תגיות: ${suggested.join(", ")}. לחצו על «החלה על הטופס» או בחרו ידנית.`,
      updates,
    };
  }

  if (wantsDurationPrice) {
    const duration = estimatePlaceDuration(placeType);
    const price = estimatePlacePrice(placeType);
    updates.push(
      {
        field: "avg_duration_minutes",
        value: duration,
        label: getFieldLabel("place", "avg_duration_minutes"),
      },
      {
        field: "estimated_price",
        value: price,
        label: getFieldLabel("place", "estimated_price"),
      }
    );
    return {
      message: `הערכה: משך ביקור ~${duration} דקות, מחיר משוער ₪${price}.`,
      updates,
    };
  }

  return helpMessage("place");
}

function handleTrail(
  text: string,
  snapshot: Record<string, unknown>,
  context: AssistantContext,
  action?: QuickActionId
): AssistantResponse {
  const name = str(snapshot.name);
  const shortDesc = str(snapshot.short_description);
  const trailType = str(snapshot.trail_type);
  const region = str(snapshot.region);
  const difficulty = str(snapshot.difficulty);
  const tags = (snapshot.tags as string[]) ?? [];
  const updates: AssistantFieldUpdate[] = [];

  const wantsFull =
    action === "full_description" ||
    matches(text, [/תיאור מלא/, /מלא תיאור/, /הרחב/]);
  const wantsAccess =
    action === "accessibility" || matches(text, [/נגישות/]);
  const wantsCoords =
    action === "coordinates" ||
    matches(text, [/קואורדינט/, /מיקום/, /התחלה/, /סיום/]);
  const wantsTags = action === "tags" || matches(text, [/תגית/, /תגיות/]);
  const wantsDurationPrice =
    action === "duration_price" ||
    matches(text, [/משך/, /מחיר/, /אורך/, /length/i]);
  const wantsWaypoints =
    action === "waypoints" ||
    matches(text, [/waypoint/, /נקודות ביניים/, /נקודה ביניים/]);
  const wantsFill = wantsHelpWithFields(text, action);

  if (wantsFill) {
    const result = buildTrailFillUpdates(snapshot);
    return {
      message: result.message,
      updates: result.updates.length > 0 ? result.updates : undefined,
    };
  }

  if (wantsFull) {
    if (!name) {
      return { message: "הזינו שם מסלול קודם." };
    }
    updates.push({
      field: "full_description",
      value: expandFullDescription(name, shortDesc, trailType, region),
      label: getFieldLabel("trail", "full_description"),
    });
    return { message: "הרחבתי את התיאור המלא.", updates };
  }

  if (wantsAccess) {
    const acc = suggestAccessibilityForTrail(trailType, difficulty);
    updates.push({
      field: "accessibility",
      value: acc,
      label: getFieldLabel("trail", "accessibility"),
    });
    return { message: `הצעתי נגישות ${acc}.`, updates };
  }

  if (wantsCoords) {
    const match = findSimilarTrail(name);
    if (match) {
      updates.push(
        { field: "start_lat", value: match.start_lat, label: getFieldLabel("trail", "start_lat") },
        { field: "start_lng", value: match.start_lng, label: getFieldLabel("trail", "start_lng") },
        { field: "end_lat", value: match.end_lat, label: getFieldLabel("trail", "end_lat") },
        { field: "end_lng", value: match.end_lng, label: getFieldLabel("trail", "end_lng") }
      );
      if (isEmpty(snapshot.region)) {
        updates.push({
          field: "region",
          value: match.region,
          label: getFieldLabel("trail", "region"),
        });
      }
      return {
        message: `${describeRegionSource("seed", match.name)} מומלץ לוודא במפה.`,
        updates,
      };
    }
    const center = getRegionCenter(region || "מרכז");
    updates.push(
      { field: "start_lat", value: center.lat, label: getFieldLabel("trail", "start_lat") },
      { field: "start_lng", value: center.lng, label: getFieldLabel("trail", "start_lng") },
      { field: "end_lat", value: center.lat + 0.02, label: getFieldLabel("trail", "end_lat") },
      { field: "end_lng", value: center.lng + 0.02, label: getFieldLabel("trail", "end_lng") }
    );
    return {
      message: describeRegionSource(region ? "selected_region" : "fallback", undefined, region || "מרכז"),
      updates,
    };
  }

  if (wantsWaypoints) {
    const match = findSimilarTrail(name);
    if (match?.waypoints && match.waypoints.length > 0) {
      updates.push({
        field: "waypoints",
        value: match.waypoints,
        label: getFieldLabel("trail", "waypoints"),
      });
      return {
        message: `העתקתי ${match.waypoints.length} נקודות ממסלול דומה «${match.name}».`,
        updates,
      };
    }
    const startLat = num(snapshot.start_lat) ?? 32.08;
    const startLng = num(snapshot.start_lng) ?? 34.78;
    const endLat = num(snapshot.end_lat) ?? startLat + 0.03;
    const endLng = num(snapshot.end_lng) ?? startLng + 0.03;
    const waypoints = interpolateWaypoints(startLat, startLng, endLat, endLng, 2);
    updates.push({
      field: "waypoints",
      value: waypoints,
      label: getFieldLabel("trail", "waypoints"),
    });
    return {
      message: "יצרתי 2 נקודות ביניים על קו התחלה→סיום. ערכי במפה.",
      updates,
    };
  }

  if (wantsTags) {
    const suggested = suggestTags("trail", trailType, region, tags);
    updates.push({
      field: "tags",
      value: Array.from(new Set([...tags, ...suggested])),
      label: getFieldLabel("trail", "tags"),
    });
    return { message: `תגיות מוצעות: ${suggested.join(", ")}.`, updates };
  }

  if (wantsDurationPrice) {
    const lengthKm = num(snapshot.length_km) ?? 5;
    const duration = Math.round(lengthKm * 20 + 30);
    const price = trailType === "מים" ? 29 : 0;
    updates.push(
      { field: "duration_minutes", value: duration, label: getFieldLabel("trail", "duration_minutes") },
      { field: "estimated_price", value: price, label: getFieldLabel("trail", "estimated_price") }
    );
    if (isEmpty(snapshot.length_km)) {
      updates.push({
        field: "length_km",
        value: lengthKm,
        label: getFieldLabel("trail", "length_km"),
      });
    }
    return {
      message: `הערכה: אורך ${lengthKm} ק״מ, משך ~${duration} דקות, מחיר ₪${price}.`,
      updates,
    };
  }

  return helpMessage("trail");
}

function buildTripFillUpdates(snapshot: Record<string, unknown>): {
  updates: AssistantFieldUpdate[];
  message: string;
} {
  const name = str(snapshot.name);
  const shortDesc = str(snapshot.short_description);
  const tags = (snapshot.tags as string[]) ?? [];
  const updates: AssistantFieldUpdate[] = [];

  if (!name) {
    return {
      updates: [],
      message:
        "הזינו שם טיול בטופס — ואז אוכל להציע תיאור קצר, תיאור מלא, תגיות ותמונה.",
    };
  }

  pushIfEmpty(
    updates,
    snapshot,
    "short_description",
    suggestTripShortDescription(name, str(snapshot.full_description), tags),
    "trip"
  );

  pushIfEmpty(
    updates,
    snapshot,
    "full_description",
    expandFullDescription(name, shortDesc, "טיול", ""),
    "trip"
  );

  const suggested = suggestTags("trip", "", "", tags);
  if (isEmpty(snapshot.tags) && suggested.length > 0) {
    pushIfEmpty(
      updates,
      snapshot,
      "tags",
      Array.from(new Set([...tags, ...suggested])),
      "trip"
    );
  }

  pushIfEmpty(updates, snapshot, "main_image", getDefaultTripImage(), "trip");

  const missing = scanMissingTripFields(snapshot);
  const stillMissing = missing.filter(
    (m) => !updates.some((u) => u.field === m.field)
  );

  const parts = [`בסיס: שם הטיול «${name}».`];

  if (updates.length > 0) {
    parts.push(
      `הכנתי ${updates.length} הצעות — בדקו את התוכן למטה ולחצו על «אישור והחלה על הטופס».`
    );
    parts.push(formatUpdatesSummary(updates).trim());
  } else if (stillMissing.length === 0) {
    parts.push("כל השדות העיקריים כבר מלאים.");
  } else {
    parts.push(scanMissingFieldsMessage("trip", stillMissing.map((m) => m.label)));
  }

  return { updates, message: parts.join("\n\n") };
}

function handleTrip(
  text: string,
  snapshot: Record<string, unknown>,
  context: AssistantContext,
  action?: QuickActionId
): AssistantResponse {
  const name = str(snapshot.name);
  const shortDesc = str(snapshot.short_description);
  const fullDesc = str(snapshot.full_description);
  const tags = (snapshot.tags as string[]) ?? [];
  const stationCount = num(snapshot.station_count) ?? 0;
  const updates: AssistantFieldUpdate[] = [];

  const wantsShort = isTripShortDescriptionRequest(text, action);
  const wantsFull = isTripFullDescriptionRequest(text, action);
  const wantsTags =
    action === "tags" || matches(text, [/תגית/, /תגיות/, /תוסיפ.*תג/]);
  const wantsImage =
    matches(text, [/תמונה/, /תצלום/, /image/i, /main_image/i]);
  const wantsStations =
    action === "stations_hint" || matches(text, [/תחנה/, /תחנות/, /station/i]);
  const wantsMissingList = isTripMissingQuery(text, action);
  const wantsFill = wantsHelpWithFields(text, action);

  if (wantsStations) {
    return {
      message:
        stationCount > 0
          ? `יש ${stationCount} תחנות בטיול. להוספת תחנות — לחצו על «הוספת תחנה» ובחרו מקום או מסלול מהרשימה.`
          : "עדיין אין תחנות. לחצו על «הוספת תחנה» או «הוספת תחנות» כדי לבנות המסלול.",
    };
  }

  if (wantsFill) {
    const result = buildTripFillUpdates(snapshot);
    return {
      message: result.message,
      updates: result.updates.length > 0 ? result.updates : undefined,
    };
  }

  if (wantsMissingList || (context === "detail" && !wantsShort && !wantsFull && !wantsTags && !wantsImage)) {
    return buildTripMissingReply(snapshot, stationCount, true);
  }

  if (wantsShort) {
    if (!name) {
      return { message: "הזינו שם טיול בטופס — ואז אוכל לכתוב תיאור קצר (שורה אחת)." };
    }
    if (!isEmpty(snapshot.short_description)) {
      return {
        message: `כבר יש תיאור קצר: «${str(snapshot.short_description)}». אפשר לערוך ידנית בטופס.`,
      };
    }
    updates.push({
      field: "short_description",
      value: suggestTripShortDescription(name, fullDesc, tags),
      label: getFieldLabel("trip", "short_description"),
    });
    return {
      message: `הכנתי תיאור קצר (שורה אחת, עד 80 תווים):${formatUpdatesSummary(updates)}\n\nלחצו על «אישור והחלה על הטופס» לפני השליחה.`,
      updates,
    };
  }

  if (wantsFull) {
    if (!name) {
      return { message: "הזינו שם טיול בטופס — ואז אוכל לכתוב תיאור מלא." };
    }
    if (isEmpty(snapshot.full_description)) {
      updates.push({
        field: "full_description",
        value: expandFullDescription(name, shortDesc, "טיול", ""),
        label: getFieldLabel("trip", "full_description"),
      });
    }
    if (matches(text, [/תג/]) && isEmpty(snapshot.tags)) {
      const suggested = suggestTags("trip", "", "", tags);
      updates.push({
        field: "tags",
        value: Array.from(new Set([...tags, ...suggested])),
        label: getFieldLabel("trip", "tags"),
      });
    }
    if (matches(text, [/תמונה|תצלום/]) && isEmpty(snapshot.main_image)) {
      updates.push({
        field: "main_image",
        value: getDefaultTripImage(),
        label: getFieldLabel("trip", "main_image"),
      });
    }
    const nameMatch = text.match(/(?:שם|name)\s*[:：]\s*(.+)/i);
    if (nameMatch?.[1]?.trim() && isEmpty(snapshot.name)) {
      updates.push({
        field: "name",
        value: nameMatch[1].trim(),
        label: getFieldLabel("trip", "name"),
      });
    }
    if (updates.length === 0) {
      return { message: "התיאור המלא כבר קיים. אפשר לבקש «תיאור קצר» או לערוך ידנית." };
    }
    return {
      message: `הכנתי ${updates.length} הצעות:${formatUpdatesSummary(updates)}\n\nלחצו על «אישור והחלה על הטופס» לפני השליחה.`,
      updates,
    };
  }

  if (wantsTags) {
    const suggested = suggestTags("trip", "", "", tags);
    updates.push({
      field: "tags",
      value: Array.from(new Set([...tags, ...suggested])),
      label: getFieldLabel("trip", "tags"),
    });
    return {
      message: `הצעתי תגיות:${formatUpdatesSummary(updates)}`,
      updates,
    };
  }

  if (wantsImage) {
    updates.push({
      field: "main_image",
      value: getDefaultTripImage(),
      label: getFieldLabel("trip", "main_image"),
    });
    return {
      message: `הצעתי תמונת ברירת מחדל:${formatUpdatesSummary(updates)}\n\nאפשר להחליף ידנית בשדה התמונה בטופס.`,
      updates,
    };
  }

  const nameMatch = text.match(/(?:שם|name)\s*[:：]\s*(.+)/i);
  if (nameMatch?.[1]?.trim()) {
    updates.push({
      field: "name",
      value: nameMatch[1].trim(),
      label: getFieldLabel("trip", "name"),
    });
    return {
      message: `הצעתי שם:${formatUpdatesSummary(updates)}`,
      updates,
    };
  }

  const compoundUpdates: AssistantFieldUpdate[] = [];
  if (matches(text, [/תכניס|הכנס|תוסיפ|תוסף|מלא|השלם|תעדכן|עדכן/])) {
    if (matches(text, [/תיאור קצר/]) && name && isEmpty(snapshot.short_description)) {
      compoundUpdates.push({
        field: "short_description",
        value: suggestTripShortDescription(name, fullDesc, tags),
        label: getFieldLabel("trip", "short_description"),
      });
    }
    if (
      matches(text, [/תיאור/]) &&
      !matches(text, [/תיאור קצר/]) &&
      name &&
      isEmpty(snapshot.full_description)
    ) {
      compoundUpdates.push({
        field: "full_description",
        value: expandFullDescription(name, shortDesc, "טיול", ""),
        label: getFieldLabel("trip", "full_description"),
      });
    }
    if (matches(text, [/תג/]) && isEmpty(snapshot.tags)) {
      const suggested = suggestTags("trip", "", "", tags);
      compoundUpdates.push({
        field: "tags",
        value: Array.from(new Set([...tags, ...suggested])),
        label: getFieldLabel("trip", "tags"),
      });
    }
    if (matches(text, [/תמונה|תצלום/]) && isEmpty(snapshot.main_image)) {
      compoundUpdates.push({
        field: "main_image",
        value: getDefaultTripImage(),
        label: getFieldLabel("trip", "main_image"),
      });
    }
    if (compoundUpdates.length > 0) {
      return {
        message: `הכנתי ${compoundUpdates.length} הצעות:${formatUpdatesSummary(compoundUpdates)}\n\nלחצו על «אישור והחלה על הטופס» כדי להחיל.`,
        updates: compoundUpdates,
      };
    }
  }

  if (matches(text, [/מה עוד/, /עוד משהו/, /נשאר/])) {
    return buildTripMissingReply(snapshot, stationCount, false);
  }

  return helpMessage("trip", snapshot);
}

export interface DemoAssistantInput {
  entity: AssistantEntity;
  messages: AssistantMessage[];
  formSnapshot: Record<string, unknown>;
  context: AssistantContext;
  quickAction?: QuickActionId;
}

export function runDemoAssistant(input: DemoAssistantInput): AssistantResponse {
  const text = input.quickAction
    ? input.quickAction.replace(/_/g, " ")
    : lastUserMessage(input.messages);

  if (!input.quickAction && isOffTopicMessage(text)) {
    return offTopicResponse();
  }

  if (!text && !input.quickAction) {
    return helpMessage(input.entity, input.formSnapshot);
  }

  switch (input.entity) {
    case "place":
      return handlePlace(text, input.formSnapshot, input.context, input.quickAction);
    case "trail":
      return handleTrail(text, input.formSnapshot, input.context, input.quickAction);
    case "trip":
      return handleTrip(text, input.formSnapshot, input.context, input.quickAction);
    default:
      return helpMessage("place");
  }
}
