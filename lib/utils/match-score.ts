import type { Difficulty, Region, Trip } from "@/types";
import { DIFFICULTY_LABELS } from "@/types/enums";
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

function regionMatch(tripRegion: Region, prefs: Pick<WizardPreferences, "region" | "regionGroup">): number {
  if (prefs.region) {
    return tripRegion === prefs.region ? 1 : 0;
  }
  if (prefs.regionGroup) {
    return getRegionsInGroup(prefs.regionGroup).includes(tripRegion) ? 1 : 0;
  }
  return 0.5;
}

function difficultyMatch(tripDifficulty: Difficulty, pref?: Difficulty): number {
  if (!pref) return 0.5;
  return tripDifficulty === pref ? 1 : 0.5;
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

function otherPreferencesMatch(trip: Trip, wizardPrefs: WizardPreferences): number {
  const prefs = wizardPrefs.specialPreferences;
  const hasExtras =
    (prefs && prefs.length > 0) ||
    wizardPrefs.wetTrip ||
    (wizardPrefs.maxBudget && wizardPrefs.maxBudget > 0) ||
    (wizardPrefs.durationHours && wizardPrefs.durationHours > 0);

  if (!hasExtras) return 0.5;

  let score = 0;
  let checks = 0;

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

export function calculateMatchScore(trip: Trip, prefs: WizardPreferences): MatchResult {
  const region = regionMatch(trip.region, prefs);
  const difficulty = difficultyMatch(trip.difficulty, prefs.difficulty);
  const accessibility = accessibilityMatch(trip.accessibility, prefs.accessibility);
  const tags = tagsOverlap(trip.tags, prefs.tags);
  const other = otherPreferencesMatch(trip, prefs);

  const score = Math.round(
    (region * 0.25 + difficulty * 0.25 + accessibility * 0.2 + tags * 0.2 + other * 0.1) * 100
  );

  const explanation: string[] = [];
  if (prefs.region) {
    explanation.push(
      region === 1 ? `מתאים לאזור ${prefs.region}` : `לא באזור ${prefs.region} (אזור הטיול: ${trip.region})`
    );
  } else if (prefs.regionGroup) {
    explanation.push(
      region === 1
        ? `מתאים לאזור ${prefs.regionGroup}`
        : `לא באזור ${prefs.regionGroup} (אזור הטיול: ${trip.region})`
    );
  }
  if (prefs.difficulty) {
    const prefLabel = prefs.difficultyLabel ?? DIFFICULTY_LABELS[prefs.difficulty];
    const tripLabel = DIFFICULTY_LABELS[trip.difficulty];
    explanation.push(
      difficulty === 1 ? `רמת קושי ${prefLabel} מתאימה` : `קושי הטיול: ${tripLabel}`
    );
  }
  if (prefs.tags && prefs.tags.length > 0) {
    const matched = prefs.tags.filter((t) => trip.tags.includes(t));
    if (matched.length > 0) explanation.push(`תגיות משותפות: ${matched.join(", ")}`);
  }

  return { trip, score, explanation };
}

export function rankTripsByMatch(trips: Trip[], prefs: WizardPreferences): MatchResult[] {
  return trips
    .map((trip) => calculateMatchScore(trip, prefs))
    .sort((a, b) => b.score - a.score);
}
