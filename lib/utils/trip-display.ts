import type { Difficulty } from "@/types";
import { DIFFICULTY_LABELS } from "@/types/enums";

export type DifficultyLabel = string;

const difficultyClassMap: Record<Difficulty, string> = {
  easy: "ti-difficulty-easy",
  easy_medium: "ti-difficulty-easy-medium",
  medium: "ti-difficulty-medium",
  medium_hard: "ti-difficulty-medium-hard",
  hard: "ti-difficulty-hard",
  challenging: "ti-difficulty-challenging",
};

/** Accepts a stored difficulty code or its Hebrew name; returns the code, or undefined if unknown. */
function resolveDifficulty(difficulty?: Difficulty | DifficultyLabel): Difficulty | undefined {
  if (!difficulty) return undefined;
  if (difficulty in DIFFICULTY_LABELS) return difficulty as Difficulty;
  return (Object.keys(DIFFICULTY_LABELS) as Difficulty[]).find(
    (code) => DIFFICULTY_LABELS[code] === difficulty
  );
}

export function getDifficultyColor(difficulty?: Difficulty | DifficultyLabel): string {
  const code = resolveDifficulty(difficulty);
  return code ? difficultyClassMap[code] : "ti-difficulty-none";
}

export function getDifficultyLabel(difficulty?: Difficulty | DifficultyLabel): string {
  const code = resolveDifficulty(difficulty);
  return code ? DIFFICULTY_LABELS[code] : "לא צוין";
}

const typeColorClasses = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-yellow-100 text-yellow-700",
  "bg-red-100 text-red-700",
  "bg-indigo-100 text-indigo-700",
] as const;

export function getTypeStyle(typeName: string): string {
  const hash = typeName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return typeColorClasses[hash % typeColorClasses.length];
}
