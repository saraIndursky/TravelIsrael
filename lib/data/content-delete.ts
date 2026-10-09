import type { Status, UserRole } from "@/types";
import { canViewContent } from "./content-access";

/** Approved content stays in DB — use remove-from-site instead of hard delete. */
export function canHardDeleteContent(
  status: Status,
  createdBy: string | null | undefined,
  role: UserRole,
  userId: string | null | undefined
): boolean {
  if (status === "approved" || status === "removed") return false;
  if (role === "admin") return true;
  if (!userId || createdBy !== userId) return false;
  return status === "draft" || status === "pending" || status === "rejected";
}

export const HARD_DELETE_APPROVED_MESSAGE =
  "לא ניתן למחוק תוכן שאושר או שהוסר מהאתר. השתמש/י ב״הסר מהאתר״ כדי להסתיר אותו מהציבור.";