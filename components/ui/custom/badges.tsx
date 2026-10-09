import type { Difficulty, Status } from "@/types";
import { DIFFICULTY_LABELS, STATUS_LABELS } from "@/types/enums";
import { Badge } from "@/components/ui/badge";

const statusVariant: Record<Status, "secondary" | "warning" | "success" | "danger" | "outline"> = {
  draft: "secondary",
  pending: "warning",
  approved: "success",
  rejected: "danger",
  removed: "outline",
};

export function StatusBadge({ status }: { status: Status }) {
  return <Badge variant={statusVariant[status]}>{STATUS_LABELS[status]}</Badge>;
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const variant = difficulty === "easy" ? "success" : difficulty === "medium" ? "warning" : "danger";
  return <Badge variant={variant}>{DIFFICULTY_LABELS[difficulty]}</Badge>;
}
