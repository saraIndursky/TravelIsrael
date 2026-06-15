import type { Difficulty } from "@/types";
import { DIFFICULTY_LABELS } from "@/types/enums";

export type DifficultyLabel =
  | "קל"
  | "קל-בינוני"
  | "בינוני"
  | "בינוני-קשה"
  | "קשה"
  | "ללא";

const difficultyClassMap: Record<DifficultyLabel, string> = {
  קל: "ti-difficulty-easy",
  "קל-בינוני": "ti-difficulty-easy-medium",
  בינוני: "ti-difficulty-medium",
  "בינוני-קשה": "ti-difficulty-medium-hard",
  קשה: "ti-difficulty-hard",
  ללא: "ti-difficulty-none",
};

const difficultyKeyMap: Record<Difficulty, DifficultyLabel> = {
  easy: "קל",
  medium: "בינוני",
  hard: "קשה",
};

function resolveDifficultyLabel(
  difficulty?: Difficulty | DifficultyLabel | string
): DifficultyLabel {
  if (!difficulty) return "ללא";

  if (difficulty in difficultyKeyMap) {
    return difficultyKeyMap[difficulty as Difficulty];
  }

  if (difficulty in difficultyClassMap) {
    return difficulty as DifficultyLabel;
  }

  const label = DIFFICULTY_LABELS[difficulty as Difficulty];
  if (label && label in difficultyClassMap) {
    return label as DifficultyLabel;
  }

  return "ללא";
}

export function getDifficultyColor(difficulty?: Difficulty | DifficultyLabel | string): string {
  return difficultyClassMap[resolveDifficultyLabel(difficulty)];
}

export function getDifficultyLabel(difficulty?: Difficulty | DifficultyLabel | string): string {
  const resolved = resolveDifficultyLabel(difficulty);
  return resolved === "ללא" ? "לא צוין" : resolved;
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
