"use client";

import { useEffect, useState } from "react";
import { getAccessibilityLevels, getDifficultyLevels } from "@/lib/data/levels";
import {
  ACCESSIBILITY_LEVELS,
  DIFFICULTY_LEVELS,
  type AccessibilityLevel,
  type DifficultyLevel,
} from "@/lib/levels";

/** Accessibility levels from the database; the built-in copy is shown until they load. */
export function useAccessibilityLevels(): readonly AccessibilityLevel[] {
  const [levels, setLevels] = useState<readonly AccessibilityLevel[]>(ACCESSIBILITY_LEVELS);
  useEffect(() => {
    let cancelled = false;
    getAccessibilityLevels()
      .then((rows) => {
        if (!cancelled) setLevels(rows);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return levels;
}

/** Difficulty levels (in order) from the database; the built-in copy is shown until they load. */
export function useDifficultyLevels(): readonly DifficultyLevel[] {
  const [levels, setLevels] = useState<readonly DifficultyLevel[]>(DIFFICULTY_LEVELS);
  useEffect(() => {
    let cancelled = false;
    getDifficultyLevels()
      .then((rows) => {
        if (!cancelled) setLevels(rows);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return levels;
}
