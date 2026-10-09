import "server-only";

import type { ContentEntityType } from "@/lib/email/templates";
import { entityRegionMatchesFilter, resolveEntityRegionId } from "@/lib/notifications/region-filter";
import { shouldDeliverNotification } from "@/lib/notifications/preference-check";
import { createClient } from "@/lib/supabase/server";
import {
  buildCommentOnContentNotification,
  buildContentRemovedNotification,
  buildContentStatusNotification,
  buildFavoriteEntityRemovedNotification,
  buildFavoriteEntityUpdatedNotification,
  buildNewApprovedNotification,
  buildRatingOnContentNotification,
  buildReportStatusNotification,
} from "@/lib/utils/notification-content";
import type { EntityType, Region } from "@/types/enums";
import type { NotificationKind } from "@/types/notification";
export async function upsertContentStatusNotification(input: {
  ownerId: string;
  entityType: ContentEntityType;
  entityId: string;
  entityName: string;
  status: "approved" | "rejected";
  rejectionReason?: string | null;
  entityPath: string;
}): Promise<{ ok: boolean; error?: string; skipped?: boolean }> {
  const supabase = createClient();
  const kind: NotificationKind =
    input.status === "approved" ? "content_approved" : "content_rejected";

  if (!(await shouldDeliverNotification(input.ownerId, kind))) {
    return { ok: true, skipped: true };
  }

  const content = buildContentStatusNotification({
    entityType: input.entityType,
    entityName: input.entityName,
    status: input.status,
    rejectionReason: input.rejectionReason,
    entityPath: input.entityPath,
  });

  const { data: unreadRows, error: listError } = await supabase
    .from("notifications")
    .select("id, created_at")
    .eq("user_id", input.ownerId)
    .eq("entity_type", input.entityType)
    .eq("entity_id", input.entityId)
    .eq("kind", content.kind)
    .is("read_at", null)
    .order("created_at", { ascending: false });

  if (listError) {
    return { ok: false, error: listError.message };
  }

  const duplicates = unreadRows ?? [];
  const keepId = duplicates[0]?.id;

  if (duplicates.length > 1) {
    const deleteIds = duplicates.slice(1).map((row) => row.id);
    await supabase.from("notifications").delete().in("id", deleteIds);
  }

  if (keepId) {
    const { error } = await supabase
      .from("notifications")
      .update({
        title: content.title,
        body: content.body,
        link_path: content.link_path,
        created_at: new Date().toISOString(),
      })
      .eq("id", keepId);

    return error ? { ok: false, error: error.message } : { ok: true };
  }

  const { error } = await supabase.from("notifications").insert({
    user_id: input.ownerId,
    kind: content.kind,
    title: content.title,
    body: content.body,
    link_path: content.link_path,
    entity_type: input.entityType,
    entity_id: input.entityId,
  });

  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function upsertContentRemovedNotification(input: {
  ownerId: string;
  entityType: ContentEntityType;
  entityId: string;
  entityName: string;
  removalReason?: string | null;
  entityPath: string;
}): Promise<{ ok: boolean; error?: string; skipped?: boolean }> {
  const supabase = createClient();

  if (!(await shouldDeliverNotification(input.ownerId, "content_removed"))) {
    return { ok: true, skipped: true };
  }

  const content = buildContentRemovedNotification({
    entityType: input.entityType,
    entityName: input.entityName,
    removalReason: input.removalReason,
    entityPath: input.entityPath,
  });

  const { data: unreadRows, error: listError } = await supabase
    .from("notifications")
    .select("id, created_at")
    .eq("user_id", input.ownerId)
    .eq("entity_type", input.entityType)
    .eq("entity_id", input.entityId)
    .eq("kind", content.kind)
    .is("read_at", null)
    .order("created_at", { ascending: false });

  if (listError) {
    return { ok: false, error: listError.message };
  }

  const duplicates = unreadRows ?? [];
  const keepId = duplicates[0]?.id;

  if (duplicates.length > 1) {
    const deleteIds = duplicates.slice(1).map((row) => row.id);
    await supabase.from("notifications").delete().in("id", deleteIds);
  }

  if (keepId) {
    const { error } = await supabase
      .from("notifications")
      .update({
        title: content.title,
        body: content.body,
        link_path: content.link_path,
        created_at: new Date().toISOString(),
      })
      .eq("id", keepId);

    return error ? { ok: false, error: error.message } : { ok: true };
  }

  const { error } = await supabase.from("notifications").insert({
    user_id: input.ownerId,
    kind: content.kind,
    title: content.title,
    body: content.body,
    link_path: content.link_path,
    entity_type: input.entityType,
    entity_id: input.entityId,
  });

  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function insertFavoriteEntityRemovedNotifications(input: {
  ownerId: string;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  entityPath: string;
  removalReason?: string | null;
}): Promise<{ ok: boolean; sent: number; error?: string }> {
  const supabase = createClient();
  const content = buildFavoriteEntityRemovedNotification({
    entityType: input.entityType,
    entityName: input.entityName,
    entityPath: input.entityPath,
    removalReason: input.removalReason,
  });

  const { data: favoriters, error: favoritesError } = await supabase
    .from("favorites")
    .select("user_id")
    .eq("entity_type", input.entityType)
    .eq("entity_id", input.entityId);

  if (favoritesError) {
    return { ok: false, sent: 0, error: favoritesError.message };
  }

  const inserts: Array<{
    user_id: string;
    kind: NotificationKind;
    title: string;
    body: string;
    link_path: string;
    entity_type: EntityType;
    entity_id: string;
  }> = [];

  for (const row of favoriters ?? []) {
    if (row.user_id === input.ownerId) continue;

    if (!(await shouldDeliverNotification(row.user_id, content.kind))) {
      continue;
    }

    const { data: existing } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", row.user_id)
      .eq("kind", content.kind)
      .eq("entity_id", input.entityId)
      .is("read_at", null)
      .maybeSingle();

    if (existing) continue;

    inserts.push({
      user_id: row.user_id,
      kind: content.kind,
      title: content.title,
      body: content.body,
      link_path: content.link_path,
      entity_type: input.entityType,
      entity_id: input.entityId,
    });
  }

  if (inserts.length === 0) {
    return { ok: true, sent: 0 };
  }

  const { error } = await supabase.from("notifications").insert(inserts);
  return error
    ? { ok: false, sent: 0, error: error.message }
    : { ok: true, sent: inserts.length };
}

export async function insertReportStatusNotification(input: {
  reporterId: string;
  entityType: ContentEntityType;
  entityId: string;
  entityName: string;
  status: "resolved" | "rejected";
  entityPath: string;
}): Promise<{ ok: boolean; error?: string; skipped?: boolean }> {
  const supabase = createClient();
  const kind: NotificationKind =
    input.status === "resolved" ? "report_resolved" : "report_rejected";

  if (!(await shouldDeliverNotification(input.reporterId, kind))) {
    return { ok: true, skipped: true };
  }

  const content = buildReportStatusNotification({
    entityType: input.entityType,
    entityName: input.entityName,
    status: input.status,
    entityPath: input.entityPath,
  });

  const { error } = await supabase.from("notifications").insert({
    user_id: input.reporterId,
    kind: content.kind,
    title: content.title,
    body: content.body,
    link_path: content.link_path,
    entity_type: input.entityType,
    entity_id: input.entityId,
  });

  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function insertCommentOnContentNotification(input: {
  ownerId: string;
  actorId: string;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  entityPath: string;
}): Promise<{ ok: boolean; error?: string; skipped?: boolean }> {
  if (input.ownerId === input.actorId) {
    return { ok: true, skipped: true };
  }

  if (!(await shouldDeliverNotification(input.ownerId, "comment_on_my_content"))) {
    return { ok: true, skipped: true };
  }

  const supabase = createClient();
  const content = buildCommentOnContentNotification({
    entityType: input.entityType,
    entityName: input.entityName,
    entityPath: input.entityPath,
  });

  const { error } = await supabase.from("notifications").insert({
    user_id: input.ownerId,
    kind: content.kind,
    title: content.title,
    body: content.body,
    link_path: content.link_path,
    entity_type: input.entityType,
    entity_id: input.entityId,
  });

  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function insertRatingOnContentNotification(input: {
  ownerId: string;
  actorId: string;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  entityPath: string;
  score: number;
}): Promise<{ ok: boolean; error?: string; skipped?: boolean }> {
  if (input.ownerId === input.actorId) {
    return { ok: true, skipped: true };
  }

  if (!(await shouldDeliverNotification(input.ownerId, "rating_on_my_content"))) {
    return { ok: true, skipped: true };
  }

  const supabase = createClient();
  const content = buildRatingOnContentNotification({
    entityType: input.entityType,
    entityName: input.entityName,
    entityPath: input.entityPath,
    score: input.score,
  });

  const { error } = await supabase.from("notifications").insert({
    user_id: input.ownerId,
    kind: content.kind,
    title: content.title,
    body: content.body,
    link_path: content.link_path,
    entity_type: input.entityType,
    entity_id: input.entityId,
  });

  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function insertNewApprovedBroadcastNotifications(input: {
  entityType: ContentEntityType;
  entityId: string;
  entityName: string;
  entityPath: string;
  region: Region;
  regionId?: string | null;
  excludeUserId?: string | null;
}): Promise<{ ok: boolean; sent: number; error?: string }> {
  const supabase = createClient();
  const entityRegionId = await resolveEntityRegionId(
    supabase as unknown as Parameters<typeof resolveEntityRegionId>[0],
    input.region,
    input.regionId
  );

  if (!entityRegionId) {
    return { ok: true, sent: 0 };
  }

  const { data: prefRows, error: prefsError } = await supabase
    .from("notification_preferences")
    .select("user_id, new_approved_content, region_ids")
    .eq("new_approved_content", true);

  if (prefsError) {
    return { ok: false, sent: 0, error: prefsError.message };
  }

  const { data: regionRows, error: regionsError } = await supabase
    .from("regions")
    .select("id, parent_id, code");

  if (regionsError) {
    return { ok: false, sent: 0, error: regionsError.message };
  }

  const content = buildNewApprovedNotification({
    entityType: input.entityType,
    entityName: input.entityName,
    entityPath: input.entityPath,
  });

  const inserts: Array<{
    user_id: string;
    kind: NotificationKind;
    title: string;
    body: string;
    link_path: string;
    entity_type: ContentEntityType;
    entity_id: string;
  }> = [];

  for (const row of prefRows ?? []) {
    if (input.excludeUserId && row.user_id === input.excludeUserId) continue;
    if (
      !entityRegionMatchesFilter(
        entityRegionId,
        (row.region_ids as string[] | null) ?? [],
        regionRows ?? []
      )
    ) {
      continue;
    }

    if (!(await shouldDeliverNotification(row.user_id, content.kind))) {
      continue;
    }

    const { data: existing } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", row.user_id)
      .eq("kind", content.kind)
      .eq("entity_id", input.entityId)
      .is("read_at", null)
      .maybeSingle();

    if (existing) continue;

    inserts.push({
      user_id: row.user_id,
      kind: content.kind,
      title: content.title,
      body: content.body,
      link_path: content.link_path,
      entity_type: input.entityType,
      entity_id: input.entityId,
    });
  }

  if (inserts.length === 0) {
    return { ok: true, sent: 0 };
  }

  const { error } = await supabase.from("notifications").insert(inserts);
  return error
    ? { ok: false, sent: 0, error: error.message }
    : { ok: true, sent: inserts.length };
}

export async function insertFavoriteEntityUpdatedNotifications(input: {
  editorId: string;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  entityPath: string;
}): Promise<{ ok: boolean; sent: number; error?: string; skipped?: boolean }> {
  const supabase = createClient();
  const content = buildFavoriteEntityUpdatedNotification({
    entityType: input.entityType,
    entityName: input.entityName,
    entityPath: input.entityPath,
  });

  const { data: favoriters, error: favoritesError } = await supabase
    .from("favorites")
    .select("user_id")
    .eq("entity_type", input.entityType)
    .eq("entity_id", input.entityId);

  if (favoritesError) {
    return { ok: false, sent: 0, error: favoritesError.message };
  }

  const inserts: Array<{
    user_id: string;
    kind: NotificationKind;
    title: string;
    body: string;
    link_path: string;
    entity_type: EntityType;
    entity_id: string;
  }> = [];

  for (const row of favoriters ?? []) {
    if (row.user_id === input.editorId) continue;

    if (!(await shouldDeliverNotification(row.user_id, content.kind))) {
      continue;
    }

    const { data: existing } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", row.user_id)
      .eq("kind", content.kind)
      .eq("entity_id", input.entityId)
      .is("read_at", null)
      .maybeSingle();

    if (existing) continue;

    inserts.push({
      user_id: row.user_id,
      kind: content.kind,
      title: content.title,
      body: content.body,
      link_path: content.link_path,
      entity_type: input.entityType,
      entity_id: input.entityId,
    });
  }

  if (inserts.length === 0) {
    return { ok: true, sent: 0, skipped: true };
  }

  const { error } = await supabase.from("notifications").insert(inserts);
  return error
    ? { ok: false, sent: 0, error: error.message }
    : { ok: true, sent: inserts.length };
}
