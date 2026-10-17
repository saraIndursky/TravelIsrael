import { createClient } from "@/lib/supabase/client";
import {
  ACCESSIBILITY_LEVELS,
  DIFFICULTY_LEVELS,
  type AccessibilityLevel,
  type DifficultyLevel,
} from "@/lib/levels";
import type { Difficulty } from "@/types/enums";
import { applyLevelOverrides } from "@/lib/levels";
import { getCurrentRole } from "./auth";

const CACHE_MS = 5 * 60_000;
let accessibilityCache: { at: number; promise: Promise<AccessibilityLevel[]> } | null = null;
let difficultyCache: { at: number; promise: Promise<DifficultyLevel[]> } | null = null;

async function fetchAccessibilityLevels(): Promise<AccessibilityLevel[]> {
  const { data, error } = await createClient()
    .from("accessibility_levels")
    .select("level, name, description")
    .order("level", { ascending: true });
  if (error) throw new Error(error.message);
  const rows = (data ?? []).map((row) => ({
    level: Number(row.level),
    name: String(row.name),
    description: String(row.description ?? ""),
  }));
  return rows.length > 0 ? rows : [...ACCESSIBILITY_LEVELS];
}

async function fetchDifficultyLevels(): Promise<DifficultyLevel[]> {
  const { data, error } = await createClient()
    .from("difficulty_levels")
    .select("code, name, description, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  const rows = (data ?? []).map((row) => ({
    code: String(row.code) as Difficulty,
    name: String(row.name),
    description: String(row.description ?? ""),
    sortOrder: Number(row.sort_order),
  }));
  return rows.length > 0 ? rows : [...DIFFICULTY_LEVELS];
}

/** The accessibility levels (1-5) with their names and explanations, from the database. */
export function getAccessibilityLevels(): Promise<AccessibilityLevel[]> {
  const now = Date.now();
  if (!accessibilityCache || now - accessibilityCache.at > CACHE_MS) {
    const promise = fetchAccessibilityLevels();
    promise.catch(() => {
      if (accessibilityCache?.promise === promise) accessibilityCache = null;
    });
    accessibilityCache = { at: now, promise };
  }
  return accessibilityCache.promise;
}

/** The difficulty levels in order, with their names and explanations, from the database. */
export function getDifficultyLevels(): Promise<DifficultyLevel[]> {
  const now = Date.now();
  if (!difficultyCache || now - difficultyCache.at > CACHE_MS) {
    const promise = fetchDifficultyLevels();
    promise.catch(() => {
      if (difficultyCache?.promise === promise) difficultyCache = null;
    });
    difficultyCache = { at: now, promise };
  }
  return difficultyCache.promise;
}

export interface LevelTextInput {
  name: string;
  description: string;
}

const MAX_NAME_LENGTH = 40;
const MAX_DESCRIPTION_LENGTH = 600;

function cleanLevelText(input: LevelTextInput): LevelTextInput {
  const name = input.name.replace(/\s+/g, " ").trim();
  const description = input.description.trim();
  if (!name) throw new Error("יש להזין שם לרמה");
  if (name.length > MAX_NAME_LENGTH) throw new Error(`שם הרמה ארוך מדי (עד ${MAX_NAME_LENGTH} תווים)`);
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    throw new Error(`ההסבר ארוך מדי (עד ${MAX_DESCRIPTION_LENGTH} תווים)`);
  }
  return { name, description };
}

async function assertAdmin(): Promise<void> {
  if ((await getCurrentRole()) !== "admin") throw new Error("אין הרשאה לעריכת רמות");
}

/** Pages read the levels through a short server cache; this asks the server to drop it. */
async function refreshSharedCaches(): Promise<void> {
  accessibilityCache = null;
  difficultyCache = null;
  try {
    await fetch("/api/revalidate-levels", { method: "POST" });
  } catch {
    // The cache expires by itself within seconds.
  }
}

/** Admin: change the name and explanation of an accessibility level (the levels themselves are fixed). */
export async function updateAccessibilityLevel(level: number, input: LevelTextInput): Promise<void> {
  await assertAdmin();
  const text = cleanLevelText(input);
  const { data, error } = await createClient()
    .from("accessibility_levels")
    .update(text)
    .eq("level", level)
    .select("level");
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("השמירה נכשלה: אין הרשאה או שהרמה לא נמצאה");
  applyLevelOverrides({ accessibility: [{ level, ...text }] });
  await refreshSharedCaches();
}

/** Admin: change the name and explanation of a difficulty level (the levels themselves are fixed). */
export async function updateDifficultyLevel(code: Difficulty, input: LevelTextInput): Promise<void> {
  await assertAdmin();
  const text = cleanLevelText(input);
  const { data, error } = await createClient()
    .from("difficulty_levels")
    .update(text)
    .eq("code", code)
    .select("code");
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("השמירה נכשלה: אין הרשאה או שהרמה לא נמצאה");
  applyLevelOverrides({ difficulty: [{ code, ...text }] });
  await refreshSharedCaches();
}
