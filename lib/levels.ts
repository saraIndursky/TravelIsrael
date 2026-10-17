import { DIFFICULTY_LABELS, type Difficulty } from "@/types/enums";

/**
 * The accessibility and difficulty levels. The database tables (`accessibility_levels`,
 * `difficulty_levels`) are the source of truth and admins edit them. This module holds a copy that
 * starts as the seed text and is refreshed from the tables (see {@link applyLevelOverrides}), so a
 * label can be read synchronously (cards, badges, server rendering) and there is always a
 * fallback if the tables can't be reached.
 */

export interface AccessibilityLevel {
  level: number;
  name: string;
  description: string;
}

export interface DifficultyLevel {
  code: Difficulty;
  name: string;
  description: string;
  sortOrder: number;
}

export const ACCESSIBILITY_LEVELS: AccessibilityLevel[] = [
  { level: 1, name: "לא נגיש", description: "שטח לא סלול, מדרגות או שיפועים חדים. לא מתאים לכיסא גלגלים או לעגלה." },
  { level: 2, name: "נגישות מוגבלת", description: "חלק מהאתר נגיש, ויש קטעים עם מדרגות או שביל לא סלול. מתאים להולכים עם קושי קל, לא לכיסא גלגלים." },
  { level: 3, name: "נגישות בינונית", description: "רוב האתר על משטח יציב ושטוח. עגלה אפשרית, כיסא גלגלים בליווי. ייתכנו מכשולים או שירותים לא נגישים." },
  { level: 4, name: "נגישות גבוהה", description: "משטח סלול, שיפועים מתונים, חניית נכים ושירותים נגישים. כיסא גלגלים עצמאי ברוב האתר." },
  { level: 5, name: "נגישות מלאה", description: "נגיש כולו לכיסא גלגלים, בלי מדרגות, עם חניה ושירותים נגישים." },
];

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  { code: "easy", name: "קל", sortOrder: 1, description: "הליכה קצרה על שביל מסודר, בלי עליות משמעותיות. מתאים לכולם, כולל ילדים." },
  { code: "easy_medium", name: "קל-בינוני", sortOrder: 2, description: "בעיקר שביל מסודר עם כמה עליות או ירידות קלות. מתאים למשפחות עם ילדים גדולים יותר." },
  { code: "medium", name: "בינוני", sortOrder: 3, description: "הליכה של כמה שעות עם עליות, מדרגות או שטח לא אחיד. דורש כושר בסיסי." },
  { code: "medium_hard", name: "בינוני-קשה", sortOrder: 4, description: "עליות תלולות או שטח מאתגר לאורך חלק מהמסלול. מתאים למי שרגיל לטייל." },
  { code: "hard", name: "קשה", sortOrder: 5, description: "מסלול ארוך או תלול, ייתכנו קטעי טיפוס או חציית נחל. דורש כושר טוב וציוד מתאים." },
  { code: "challenging", name: "מאתגר", sortOrder: 6, description: "מסלול תובעני מאוד: טיפוס, שטח קשה או מרחק גדול. למטיילים מנוסים בלבד." },
];

/** Position of a difficulty on the scale (1 = easiest). Unknown values rank as the first level. */
export function difficultyRank(code: string): number {
  return DIFFICULTY_LEVELS.find((level) => level.code === code)?.sortOrder ?? 1;
}

/** Whether a difficulty is at the demanding end of the scale ("קשה" and above). */
export function isHardDifficulty(code: string): boolean {
  return difficultyRank(code) >= difficultyRank("hard");
}

const SEED_ACCESSIBILITY: readonly AccessibilityLevel[] = ACCESSIBILITY_LEVELS.map((level) => ({ ...level }));
const SEED_DIFFICULTY: readonly DifficultyLevel[] = DIFFICULTY_LEVELS.map((level) => ({ ...level }));

/** The original names and explanations, before any admin edit. */
export function getSeedLevels(): {
  accessibility: readonly AccessibilityLevel[];
  difficulty: readonly DifficultyLevel[];
} {
  return { accessibility: SEED_ACCESSIBILITY, difficulty: SEED_DIFFICULTY };
}

export interface LevelOverrides {
  accessibility?: readonly { level: number; name: string; description: string }[];
  difficulty?: readonly { code: string; name: string; description: string }[];
}

/**
 * Updates the built-in copy with the names and explanations an admin saved in the database.
 * Only the text changes: the set of levels and their order are fixed in code, because the rest of
 * the app (colours, trip difficulty, match score) depends on them. Unknown rows are ignored.
 */
export function applyLevelOverrides(overrides: LevelOverrides): void {
  for (const row of overrides.accessibility ?? []) {
    const level = ACCESSIBILITY_LEVELS.find((entry) => entry.level === row.level);
    if (level && row.name.trim()) {
      level.name = row.name;
      level.description = row.description;
    }
  }
  for (const row of overrides.difficulty ?? []) {
    const level = DIFFICULTY_LEVELS.find((entry) => entry.code === row.code);
    if (level && row.name.trim()) {
      level.name = row.name;
      level.description = row.description;
      DIFFICULTY_LABELS[level.code] = row.name;
    }
  }
}
