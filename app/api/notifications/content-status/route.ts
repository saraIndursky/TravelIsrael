import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getEntityDetailPath,
  sendContentStatusEmail,
  type ContentEntityType,
} from "@/lib/email/templates";
import {
  insertNewApprovedBroadcastNotifications,
  upsertContentStatusNotification,
} from "@/lib/notifications/server";
import type { Region } from "@/types/enums";

interface ContentStatusBody {
  entityType?: ContentEntityType;
  entityId?: string;
  entityName?: string;
  ownerId?: string | null;
  status?: "approved" | "rejected";
  rejectionReason?: string | null;
  region?: Region;
  regionId?: string | null;
}

function isRegion(value: unknown): value is Region {
  return (
    value === "צפון" ||
    value === "גליל" ||
    value === "כרמל" ||
    value === "מרכז" ||
    value === "ירושלים" ||
    value === "יהודה ושומרון" ||
    value === "נגב" ||
    value === "אילת" ||
    value === "ים המלח" ||
    value === "חוף"
  );
}

function isContentEntityType(value: unknown): value is ContentEntityType {
  return value === "place" || value === "trail" || value === "trip";
}

function isContentStatus(value: unknown): value is "approved" | "rejected" {
  return value === "approved" || value === "rejected";
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

  let body: ContentStatusBody;
  try {
    body = (await request.json()) as ContentStatusBody;
  } catch {
    return NextResponse.json({ ok: false, message: "בקשה לא תקינה" }, { status: 400 });
  }

  if (
    !isContentEntityType(body.entityType) ||
    typeof body.entityId !== "string" ||
    typeof body.entityName !== "string" ||
    !isContentStatus(body.status)
  ) {
    return NextResponse.json({ ok: false, message: "בקשה לא תקינה" }, { status: 400 });
  }

  if (!body.ownerId) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const entityPath = getEntityDetailPath(body.entityType, body.entityId);

  const notificationResult = await upsertContentStatusNotification({
    ownerId: body.ownerId,
    entityType: body.entityType,
    entityId: body.entityId,
    entityName: body.entityName,
    status: body.status,
    rejectionReason: body.rejectionReason,
    entityPath,
  });

  if (!notificationResult.ok) {
    return NextResponse.json(
      { ok: false, message: "יצירת התראה נכשלה", detail: notificationResult.error },
      { status: 500 }
    );
  }

  if (body.status === "approved" && isRegion(body.region)) {
    const broadcastResult = await insertNewApprovedBroadcastNotifications({
      entityType: body.entityType,
      entityId: body.entityId,
      entityName: body.entityName,
      entityPath,
      region: body.region,
      regionId: body.regionId,
      excludeUserId: body.ownerId,
    });

    if (!broadcastResult.ok) {
      return NextResponse.json(
        { ok: false, message: "שידור התראות נכשל", detail: broadcastResult.error },
        { status: 500 }
      );
    }
  }

  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select("email, name")
    .eq("id", body.ownerId)
    .maybeSingle();

  if (!ownerProfile?.email) {
    return NextResponse.json({ ok: true, emailSent: false });
  }

  const sent = await sendContentStatusEmail({
    to: ownerProfile.email,
    ownerName: ownerProfile.name,
    entityType: body.entityType,
    entityName: body.entityName,
    status: body.status,
    rejectionReason: body.rejectionReason,
    entityPath,
  });

  return NextResponse.json({ ok: true, emailSent: sent });
}
