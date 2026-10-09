import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getEntityDetailPath,
  sendContentRemovedEmail,
  type ContentEntityType,
} from "@/lib/email/templates";
import {
  insertFavoriteEntityRemovedNotifications,
  upsertContentRemovedNotification,
} from "@/lib/notifications/server";

interface ContentRemovedBody {
  entityType?: ContentEntityType;
  entityId?: string;
  entityName?: string;
  ownerId?: string | null;
  removalReason?: string | null;
}

function isContentEntityType(value: unknown): value is ContentEntityType {
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

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (adminProfile?.role !== "admin") {
    return NextResponse.json({ ok: false, message: "אין הרשאה" }, { status: 403 });
  }

  let body: ContentRemovedBody;
  try {
    body = (await request.json()) as ContentRemovedBody;
  } catch {
    return NextResponse.json({ ok: false, message: "בקשה לא תקינה" }, { status: 400 });
  }

  if (
    !isContentEntityType(body.entityType) ||
    typeof body.entityId !== "string" ||
    typeof body.entityName !== "string"
  ) {
    return NextResponse.json({ ok: false, message: "בקשה לא תקינה" }, { status: 400 });
  }

  if (!body.ownerId) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const entityPath = getEntityDetailPath(body.entityType, body.entityId);

  const notificationResult = await upsertContentRemovedNotification({
    ownerId: body.ownerId,
    entityType: body.entityType,
    entityId: body.entityId,
    entityName: body.entityName,
    removalReason: body.removalReason,
    entityPath,
  });

  if (!notificationResult.ok) {
    return NextResponse.json(
      { ok: false, message: "יצירת התראה נכשלה", detail: notificationResult.error },
      { status: 500 }
    );
  }

  const favoritersResult = await insertFavoriteEntityRemovedNotifications({
    ownerId: body.ownerId,
    entityType: body.entityType,
    entityId: body.entityId,
    entityName: body.entityName,
    entityPath,
    removalReason: body.removalReason,
  });

  if (!favoritersResult.ok) {
    return NextResponse.json(
      { ok: false, message: "התראות למועדפים נכשלו", detail: favoritersResult.error },
      { status: 500 }
    );
  }

  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select("email, name")
    .eq("id", body.ownerId)
    .maybeSingle();

  if (!ownerProfile?.email) {
    return NextResponse.json({ ok: true, emailSent: false, favoritersNotified: favoritersResult.sent });
  }

  const sent = await sendContentRemovedEmail({
    to: ownerProfile.email,
    ownerName: ownerProfile.name,
    entityType: body.entityType,
    entityName: body.entityName,
    removalReason: body.removalReason,
    entityPath,
  });

  return NextResponse.json({
    ok: true,
    emailSent: sent,
    favoritersNotified: favoritersResult.sent,
  });
}
