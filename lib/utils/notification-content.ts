import type { ContentEntityType } from "@/lib/email/templates";
import type { EntityType } from "@/types/enums";
import type { NotificationKind } from "@/types/notification";

const ENTITY_LABELS: Record<ContentEntityType, string> = {
  place: "מקום",
  trail: "מסלול",
  trip: "טיול",
};

const REPORT_ENTITY_LABELS: Record<EntityType, string> = {
  place: "המקום",
  trail: "המסלול",
  trip: "הטיול",
};

const SOCIAL_ENTITY_LABELS: Record<EntityType, string> = {
  place: "מקום",
  trail: "מסלול",
  trip: "טיול",
};

export function buildContentStatusNotification(input: {
  entityType: ContentEntityType;
  entityName: string;
  status: "approved" | "rejected";
  rejectionReason?: string | null;
  entityPath: string;
}): {
  kind: NotificationKind;
  title: string;
  body: string;
  link_path: string;
} {
  const label = ENTITY_LABELS[input.entityType];
  const isApproved = input.status === "approved";
  const kind: NotificationKind = isApproved ? "content_approved" : "content_rejected";
  const title = isApproved ? `${label} "${input.entityName}" אושר` : `${label} "${input.entityName}" נדחה`;

  let body = isApproved
    ? `ה${label} שלך אושר ומוצג כעת באתר.`
    : `ה${label} שלך נדחה ודורש עריכה לפני שליחה מחדש.`;

  if (!isApproved && input.rejectionReason?.trim()) {
    body += ` סיבה: ${input.rejectionReason.trim()}`;
  }

  return {
    kind,
    title,
    body,
    link_path: input.entityPath,
  };
}

export function buildContentRemovedNotification(input: {
  entityType: ContentEntityType;
  entityName: string;
  removalReason?: string | null;
  entityPath: string;
}): {
  kind: NotificationKind;
  title: string;
  body: string;
  link_path: string;
} {
  const label = ENTITY_LABELS[input.entityType];
  let body = `ה${label} שלך הוסר מהאתר ולא מוצג עוד לציבור. ניתן לשלוח אותו שוב לאישור.`;
  if (input.removalReason?.trim()) {
    body += ` סיבה: ${input.removalReason.trim()}`;
  }
  return {
    kind: "content_removed",
    title: `${label} "${input.entityName}" הוסר מהאתר`,
    body,
    link_path: input.entityPath,
  };
}

export function buildFavoriteEntityRemovedNotification(input: {
  entityType: EntityType;
  entityName: string;
  entityPath: string;
  removalReason?: string | null;
}): {
  kind: NotificationKind;
  title: string;
  body: string;
  link_path: string;
} {
  const label = SOCIAL_ENTITY_LABELS[input.entityType];
  let body = `${label} ששמרת במועדפים הוסר מהאתר. אפשר לצפות בו כל עוד השמירה פעילה.`;
  if (input.removalReason?.trim()) {
    body += ` סיבה: ${input.removalReason.trim()}`;
  }
  return {
    kind: "favorite_entity_removed",
    title: `${label} "${input.entityName}" הוסר מהאתר`,
    body,
    link_path: input.entityPath,
  };
}

export function buildReportStatusNotification(input: {
  entityType: EntityType;
  entityName: string;
  status: "resolved" | "rejected";
  entityPath: string;
}): {
  kind: NotificationKind;
  title: string;
  body: string;
  link_path: string;
} {
  const label = REPORT_ENTITY_LABELS[input.entityType];
  const isResolved = input.status === "resolved";
  const kind: NotificationKind = isResolved ? "report_resolved" : "report_rejected";
  const title = isResolved
    ? `הדיווח על ${label} "${input.entityName}" טופל`
    : `הדיווח על ${label} "${input.entityName}" נדחה`;
  const body = isResolved
    ? "תודה על הדיווח. בדקנו את הפנייה וטיפלנו בה."
    : "בדקנו את הפנייה ולא מצאנו עילה לעדכון התוכן.";

  return {
    kind,
    title,
    body,
    link_path: input.entityPath,
  };
}

export function buildCommentOnContentNotification(input: {
  entityType: EntityType;
  entityName: string;
  entityPath: string;
}): {
  kind: NotificationKind;
  title: string;
  body: string;
  link_path: string;
} {
  const label = SOCIAL_ENTITY_LABELS[input.entityType];
  return {
    kind: "comment_on_my_content",
    title: `תגובה חדשה על ${label} "${input.entityName}"`,
    body: "מישהו השאיר תגובה על התוכן שיצרת.",
    link_path: input.entityPath,
  };
}

export function buildRatingOnContentNotification(input: {
  entityType: EntityType;
  entityName: string;
  entityPath: string;
  score: number;
}): {
  kind: NotificationKind;
  title: string;
  body: string;
  link_path: string;
} {
  const label = SOCIAL_ENTITY_LABELS[input.entityType];
  return {
    kind: "rating_on_my_content",
    title: `דירוג חדש על ${label} "${input.entityName}"`,
    body: `קיבלת דירוג של ${input.score} כוכבים על התוכן שיצרת.`,
    link_path: input.entityPath,
  };
}

export function newApprovedNotificationKind(
  entityType: ContentEntityType
): NotificationKind {
  switch (entityType) {
    case "place":
      return "new_approved_place";
    case "trail":
      return "new_approved_trail";
    case "trip":
      return "new_approved_trip";
  }
}

export function buildNewApprovedNotification(input: {
  entityType: ContentEntityType;
  entityName: string;
  entityPath: string;
}): {
  kind: NotificationKind;
  title: string;
  body: string;
  link_path: string;
} {
  const label = ENTITY_LABELS[input.entityType];
  const kind = newApprovedNotificationKind(input.entityType);
  return {
    kind,
    title: `${label} חדש: "${input.entityName}"`,
    body: `${label} חדש אושר באזור שמעניין אותך.`,
    link_path: input.entityPath,
  };
}

export function buildFavoriteEntityUpdatedNotification(input: {
  entityType: EntityType;
  entityName: string;
  entityPath: string;
}): {
  kind: NotificationKind;
  title: string;
  body: string;
  link_path: string;
} {
  const label = SOCIAL_ENTITY_LABELS[input.entityType];
  return {
    kind: "favorite_entity_updated",
    title: `עדכון ב${label} "${input.entityName}"`,
    body: "הבעלים עדכן תוכן ששמרת במועדפים.",
    link_path: input.entityPath,
  };
}
