"use client";

import { applyLevelOverrides, type LevelOverrides } from "@/lib/levels";

/**
 * Hands the level names/explanations the server read from the database to the browser's copy of
 * the levels. It runs while rendering, before the pages below it, so server and browser render the
 * same labels and nothing flashes or mismatches.
 */
export function LevelsHydrator({ overrides }: { overrides: LevelOverrides | null }) {
  if (overrides) applyLevelOverrides(overrides);
  return null;
}
