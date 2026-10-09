import type { ContentEntityType } from "@/lib/email/templates";
import type { EntityType, Region } from "@/types/enums";

export async function notifyContentStatusChange(input: {
  entityType: ContentEntityType;
  entityId: string;
  entityName: string;
  ownerId: string | null;
  status: "approved" | "rejected";
  rejectionReason?: string | null;
  region?: Region;
  regionId?: string | null;
}): Promise<void> {
  try {
    await fetch("/api/notifications/content-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    // Email failure must not block admin actions
  }
}

export async function notifyContentRemoved(input: {
  entityType: ContentEntityType;
  entityId: string;
  entityName: string;
  ownerId: string | null;
  removalReason?: string | null;
}): Promise<void> {
  try {
    await fetch("/api/notifications/content-removed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    // Notification failure must not block admin actions
  }
}

export async function notifyReportStatusChange(input: {
  reportId: string;
  reporterId: string;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  status: "resolved" | "rejected";
}): Promise<void> {
  try {
    await fetch("/api/notifications/report-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    // Notification failure must not block admin actions
  }
}

export async function notifyWelcomeEmail(): Promise<void> {
  try {
    await fetch("/api/notifications/welcome", { method: "POST" });
  } catch {
    // Email failure must not block registration
  }
}

export async function notifySocialActivity(input: {
  entityType: EntityType;
  entityId: string;
  event: "comment" | "rating";
}): Promise<void> {
  try {
    await fetch("/api/notifications/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    // Notification failure must not block social actions
  }
}

export async function notifyFavoriteEntityUpdated(input: {
  entityType: EntityType;
  entityId: string;
}): Promise<void> {
  try {
    await fetch("/api/notifications/favorite-updated", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    // Notification failure must not block edits
  }
}