import { NextResponse } from "next/server";
import { getEntityDetailPath, type ContentEntityType } from "@/lib/email/templates";
import { insertFavoriteEntityUpdatedNotifications } from "@/lib/notifications/server";
import { createClient } from "@/lib/supabase/server";
import type { EntityType } from "@/types/enums";

interface FavoriteUpdatedBody {
  entityType?: EntityType;
  entityId?: string;
}

const RECENT_MS = 120_000;

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

  let body: FavoriteUpdatedBody;
  try {
    body = (await request.json()) as FavoriteUpdatedBody;
  } catch {
    return NextResponse.json({ ok: false, message: "בקשה לא תקינה" }, { status: 400 });
  }

  if (!isEntityType(body.entityType) || typeof body.entityId !== "string") {
    return NextResponse.json({ ok: false, message: "בקשה לא תקינה" }, { status: 400 });
  }

  const table =
    body.entityType === "place" ? "places" : body.entityType === "trail" ? "trails" : "trips";

  const since = new Date(Date.now() - RECENT_MS).toISOString();
  const { data: entity, error } = await supabase
    .from(table)
    .select("name, created_by, updated_at")
    .eq("id", body.entityId)
    .maybeSingle();

  if (error || !entity) {
    return NextResponse.json({ ok: false, message: "ישות לא נמצאה" }, { status: 404 });
  }

  if (entity.created_by !== user.id) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  if (!entity.updated_at || entity.updated_at < since) {
    return NextResponse.json({ ok: false, message: "עדכון לא נמצא" }, { status: 400 });
  }

  const entityPath = getEntityDetailPath(
    body.entityType as ContentEntityType,
    body.entityId
  );

  const result = await insertFavoriteEntityUpdatedNotifications({
    editorId: user.id,
    entityType: body.entityType,
    entityId: body.entityId,
    entityName: entity.name,
    entityPath,
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: "יצירת התראה נכשלה", detail: result.error },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, sent: result.sent, skipped: result.skipped ?? false });
}
