import type { Difficulty, Region, Trip } from "@/types";
import { DIFFICULTY_LABELS } from "@/types/enums";
import { difficultyRank } from "@/lib/levels";
import { getRegionsInGroup } from "@/lib/utils/region-groups";

export interface WizardPreferences {
  region?: Region;
  regionGroup?: string;
  difficulty?: Difficulty;
  difficultyLabel?: string;
  accessibility?: number;
  tripType?: string;
  tags?: string[];
  specialPreferences?: string[];
  wetTrip?: boolean;
  maxBudget?: number;
  durationHours?: number;
}

export interface MatchResult {
  trip: Trip;
  score: number;
  explanation: string[];
}

/** Trips below this score are hidden from wizard results (Phase 1). */
export const MIN_MATCH_SCORE = 40;

function regionMatch(tripRegion: Region, prefs: Pick<WizardPreferences, "region" | "regionGroup">): number {
  if (prefs.region) {
    return tripRegion === prefs.region ? 1 : 0;
  }
  if (prefs.regionGroup) {
    return getRegionsInGroup(prefs.regionGroup).includes(tripRegion) ? 1 : 0;
  }
  return 0.5;
}

/** Full score for the same level, losing a quarter for each step away on the difficulty scale. */
function difficultyMatch(tripDifficulty: Difficulty, pref?: Difficulty): number {
  if (!pref) return 0.5;
  const distance = Math.abs(difficultyRank(tripDifficulty) - difficultyRank(pref));
  return Math.max(0, 1 - distance * 0.25);
}

function accessibilityMatch(tripAccessibility: number, pref?: number): number {
  if (!pref) return 0.5;
  return tripAccessibility >= pref ? 1 : tripAccessibility / pref;
}

function tagsOverlap(tripTags: string[], prefTags?: string[]): number {
  if (!prefTags || prefTags.length === 0) return 0.5;
  const overlap = prefTags.filter((t) => tripTags.includes(t)).length;
  return overlap / prefTags.length;
}

function tripTypeMatch(tripTags: string[], tripType?: string): number {
  if (!tripType) return 0.5;
  return tripTags.includes(tripType) ? 1 : 0;
}

function otherPreferencesMatch(trip: Trip, wizardPrefs: WizardPreferences): number {
  const prefs = wizardPrefs.specialPreferences;
  const hasExtras =
    (prefs && prefs.length > 0) ||
    wizardPrefs.wetTrip ||
    (wizardPrefs.maxBudget && wizardPrefs.maxBudget > 0) ||
    (wizardPrefs.durationHours && wizardPrefs.durationHours > 0) ||
    Boolean(wizardPrefs.tripType);

  if (!hasExtras) return 0.5;

  let score = 0;
  let checks = 0;

  if (wizardPrefs.tripType) {
    checks += 1;
    score += tripTypeMatch(trip.tags, wizardPrefs.tripType);
  }

  if (prefs && prefs.length > 0) {
    if (prefs.includes("חינם")) {
      checks += 1;
      if (trip.estimated_price === 0) score += 1;
    }
    if (prefs.includes("משפחות")) {
      checks += 1;
      if (trip.tags.includes("משפחות")) score += 1;
    }
    if (prefs.includes("נוף")) {
      checks += 1;
      if (trip.tags.includes("נוף")) score += 1;
    }
  }

  if (wizardPrefs.wetTrip) {
    checks += 1;
    const wetTags = ["מים", "ים", "צלילה"];
    if (wetTags.some((t) => trip.tags.includes(t))) {
      score += 1;
    } else {
      score += 0.4;
    }
  }

  if (wizardPrefs.maxBudget && wizardPrefs.maxBudget > 0) {
    checks += 1;
    score += trip.estimated_price <= wizardPrefs.maxBudget ? 1 : 0.2;
  }

  if (wizardPrefs.durationHours && wizardPrefs.durationHours > 0) {
    checks += 1;
    const tripHours = trip.total_duration_minutes / 60;
    const diff = Math.abs(tripHours - wizardPrefs.durationHours);
    score += diff <= 2 ? 1 : diff <= 4 ? 0.6 : 0.3;
  }

  return checks > 0 ? score / checks : 0.5;
}

/**
 * Rule-based Hebrew explanation for why a trip matches prefs.
 * Phase 2 (OpenAI): swap/augment this via the same signature — keep as fallback.
 */
export function buildMatchExplanation(trip: Trip, prefs: WizardPreferences): string[] {
  const region = regionMatch(trip.region, prefs);
  const difficulty = difficultyMatch(trip.difficulty, prefs.difficulty);
  const accessibility = accessibilityMatch(trip.accessibility, prefs.accessibility);
  const tags = tagsOverlap(trip.tags, prefs.tags);
  const explanation: string[] = [];

  if (prefs.region) {
    explanation.push(
      region === 1
        ? `מתאים לאזור שבחרת: ${prefs.region}`
        : `באזור ${trip.region} (ביקשת ${prefs.region})`
    );
  } else if (prefs.regionGroup) {
    explanation.push(
      region === 1
        ? `מתאים לאזור שבחרת: ${prefs.regionGroup}`
        : `באזור ${trip.region} (ביקשת ${prefs.regionGroup})`
    );
  }

  if (prefs.difficulty) {
    const prefLabel = prefs.difficultyLabel ?? DIFFICULTY_LABELS[prefs.difficulty];
    const tripLabel = DIFFICULTY_LABELS[trip.difficulty];
    explanation.push(
      difficulty === 1
        ? `רמת הקושי מתאימה: ${prefLabel}`
        : `קושי הטיול ${tripLabel} (ביקשת ${prefLabel})`
    );
  }

  if (prefs.accessibility) {
    explanation.push(
      accessibility >= 1
        ? `רמת נגישות מתאימה (${trip.accessibility}/5)`
        : `נגישות ${trip.accessibility}/5 (ביקשת לפחות ${prefs.accessibility})`
    );
  }

  if (prefs.tripType) {
    explanation.push(
      trip.tags.includes(prefs.tripType)
        ? `מתאים לסוג טיול: ${prefs.tripType}`
        : `סוג הטיול שבחרת (${prefs.tripType}) לא מופיע בתגיות`
    );
  }

  if (prefs.tags && prefs.tags.length > 0) {
    const matched = prefs.tags.filter((t) => trip.tags.includes(t));
    if (matched.length > 0) {
      explanation.push(`תגיות משותפות: ${matched.join(", ")}`);
    } else if (tags < 0.5) {
      explanation.push("אין חפיפה עם התגיות שבחרת");
    }
  }

  if (prefs.wetTrip) {
    const wetTags = ["מים", "ים", "צלילה"];
    explanation.push(
      wetTags.some((t) => trip.tags.includes(t))
        ? "מתאים לטיול עם מים"
        : "לא זוהו תגיות מים בטיול"
    );
  }

  if (prefs.maxBudget && prefs.maxBudget > 0) {
    explanation.push(
      trip.estimated_price <= prefs.maxBudget
        ? `בתקציב שלך (עד ₪${prefs.maxBudget})`
        : `מעל התקציב שבחרת (₪${trip.estimated_price} מול עד ₪${prefs.maxBudget})`
    );
  }

  if (prefs.durationHours && prefs.durationHours > 0) {
    const tripHours = Math.round((trip.total_duration_minutes / 60) * 10) / 10;
    const diff = Math.abs(tripHours - prefs.durationHours);
    explanation.push(
      diff <= 2
        ? `משך הטיול קרוב לבקשה (~${tripHours} שעות)`
        : `משך הטיול ~${tripHours} שעות (ביקשת כ-${prefs.durationHours})`
    );
  }

  if (prefs.specialPreferences?.includes("חינם") && trip.estimated_price === 0) {
    explanation.push("טיול ללא עלות כניסה");
  }
  if (prefs.specialPreferences?.includes("משפחות") && trip.tags.includes("משפחות")) {
    explanation.push("מתאים למשפחות");
  }
  if (prefs.specialPreferences?.includes("נוף") && trip.tags.includes("נוף")) {
    explanation.push("כולל תגית נוף");
  }

  if (explanation.length === 0) {
    explanation.push("התאמה כללית לפי ההעדפות שבחרת באשף");
  }

  return explanation;
}

export function calculateMatchScore(trip: Trip, prefs: WizardPreferences): MatchResult {
  const region = regionMatch(trip.region, prefs);
  const difficulty = difficultyMatch(trip.difficulty, prefs.difficulty);
  const accessibility = accessibilityMatch(trip.accessibility, prefs.accessibility);
  const tags = tagsOverlap(trip.tags, prefs.tags);
  const other = otherPreferencesMatch(trip, prefs);

  const score = Math.round(
    (region * 0.25 + difficulty * 0.25 + accessibility * 0.2 + tags * 0.2 + other * 0.1) * 100
  );

  return {
    trip,
    score,
    explanation: buildMatchExplanation(trip, prefs),
  };
}

export function rankTripsByMatch(
  trips: Trip[],
  prefs: WizardPreferences,
  options?: { minScore?: number }
): MatchResult[] {
  const minScore = options?.minScore ?? MIN_MATCH_SCORE;
  return trips
    .map((trip) => calculateMatchScore(trip, prefs))
    .filter((result) => result.score >= minScore)
    .sort((a, b) => b.score - a.score);
}
