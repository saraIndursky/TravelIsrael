import { NextResponse } from "next/server";
import { getEntityOwnerInfo } from "@/lib/notifications/entity-owner";
import {
  insertCommentOnContentNotification,
  insertRatingOnContentNotification,
} from "@/lib/notifications/server";
import { createClient } from "@/lib/supabase/server";
import type { EntityType } from "@/types/enums";

interface SocialNotificationBody {
  entityType?: EntityType;
  entityId?: string;
  event?: "comment" | "rating";
}

const RECENT_MS = 60_000;

function isEntityType(value: unknown): value is EntityType {
  return value === "place" || value === "trail" || value === "trip";
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, message: "לא מחובר" }, { status: 401 });
  }

  let body: SocialNotificationBody;
  try {
    body = (await request.json()) as SocialNotificationBody;
  } catch {
    return NextResponse.json({ ok: false, message: "בקשה לא תקינה" }, { status: 400 });
  }

  if (!isEntityType(body.entityType) || typeof body.entityId !== "string") {
    return NextResponse.json({ ok: false, message: "בקשה לא תקינה" }, { status: 400 });
  }

  if (body.event !== "comment" && body.event !== "rating") {
    return NextResponse.json({ ok: false, message: "בקשה לא תקינה" }, { status: 400 });
  }

  const ownerInfo = await getEntityOwnerInfo(body.entityType, body.entityId);
  if (!ownerInfo) {
    return NextResponse.json({ ok: false, message: "ישות לא נמצאה" }, { status: 404 });
  }

  const since = new Date(Date.now() - RECENT_MS).toISOString();

  if (body.event === "comment") {
    const { data: comment } = await supabase
      .from("comments")
      .select("id, created_at")
      .eq("user_id", user.id)
      .eq("entity_type", body.entityType)
      .eq("entity_id", body.entityId)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!comment) {
      return NextResponse.json({ ok: false, message: "תגובה לא נמצאה" }, { status: 400 });
    }

    const result = await insertCommentOnContentNotification({
      ownerId: ownerInfo.ownerId,
      actorId: user.id,
      entityType: body.entityType,
      entityId: body.entityId,
      entityName: ownerInfo.entityName,
      entityPath: ownerInfo.entityPath,
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, message: "יצירת התראה נכשלה", detail: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, skipped: result.skipped ?? false });
  }

  const { data: rating } = await supabase
    .from("ratings")
    .select("score, created_at")
    .eq("user_id", user.id)
    .eq("entity_type", body.entityType)
    .eq("entity_id", body.entityId)
    .maybeSingle();

  if (!rating || rating.created_at < since) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const result = await insertRatingOnContentNotification({
    ownerId: ownerInfo.ownerId,
    actorId: user.id,
    entityType: body.entityType,
    entityId: body.entityId,
    entityName: ownerInfo.entityName,
    entityPath: ownerInfo.entityPath,
    score: rating.score,
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: "יצירת התראה נכשלה", detail: result.error },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, skipped: result.skipped ?? false });
}
