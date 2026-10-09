import type { Status, UserRole } from "@/types";

/** Who may view a row by status (detail / single fetch). Lists filter removed separately. */
export function canViewContent(
  status: Status,
  createdBy: string,
  role: UserRole,
  userId: string | null,
  isFavorited: boolean
): boolean {
  if (role === "admin") return true;
  if (status === "approved") return true;
  if (status === "removed") {
    if (role !== "user" || !userId) return false;
    if (createdBy === userId) return true;
    return isFavorited;
  }
  if (role === "user" && userId && createdBy === userId) return true;
  return false;
}

/** Hide admin-removed content from public discovery lists (profile uses createdBy filter). */
export function isVisibleInDiscoveryList(status: Status, hasCreatedByFilter: boolean): boolean {
  if (status === "removed" && !hasCreatedByFilter) return false;
  return true;
}
