import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getEntityDetailPath,
  type ContentEntityType,
} from "@/lib/email/templates";
import { insertReportStatusNotification } from "@/lib/notifications/server";

interface ReportStatusBody {
  reportId?: string;
  reporterId?: string;
  entityType?: ContentEntityType;
  entityId?: string;
  entityName?: string;
  status?: "resolved" | "rejected";
}

function isContentEntityType(value: unknown): value is ContentEntityType {
  return value === "place" || value === "trail" || value === "trip";
}

function isReportStatus(value: unknown): value is "resolved" | "rejected" {
  return value === "resolved" || value === "rejected";
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

  let body: ReportStatusBody;
  try {
    body = (await request.json()) as ReportStatusBody;
  } catch {
    return NextResponse.json({ ok: false, message: "בקשה לא תקינה" }, { status: 400 });
  }

  if (
    typeof body.reportId !== "string" ||
    typeof body.reporterId !== "string" ||
    !isContentEntityType(body.entityType) ||
    typeof body.entityId !== "string" ||
    typeof body.entityName !== "string" ||
    !isReportStatus(body.status)
  ) {
    return NextResponse.json({ ok: false, message: "בקשה לא תקינה" }, { status: 400 });
  }

  const { data: report } = await supabase
    .from("reports")
    .select("id, user_id, entity_type, entity_id, status")
    .eq("id", body.reportId)
    .maybeSingle();

  if (
    !report ||
    report.user_id !== body.reporterId ||
    report.entity_type !== body.entityType ||
    report.entity_id !== body.entityId ||
    report.status !== body.status
  ) {
    return NextResponse.json({ ok: false, message: "דיווח לא תואם" }, { status: 400 });
  }

  const entityPath = getEntityDetailPath(body.entityType, body.entityId);

  const notificationResult = await insertReportStatusNotification({
    reporterId: body.reporterId,
    entityType: body.entityType,
    entityId: body.entityId,
    entityName: body.entityName,
    status: body.status,
    entityPath,
  });

  if (!notificationResult.ok) {
    return NextResponse.json(
      { ok: false, message: "יצירת התראה נכשלה", detail: notificationResult.error },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
