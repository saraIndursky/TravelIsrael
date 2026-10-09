import type { EntityType, Report, ReportStatus, ReportType, ReportWithEntityName } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { mapReport } from "@/lib/supabase/mappers";
import { getCurrentRole, getCurrentUser } from "./auth";

const MISSING_ENTITY_NAME = "תוכן לא זמין";

async function loadEntityNames(
  reports: Report[]
): Promise<Map<string, string>> {
  const supabase = createClient();
  const names = new Map<string, string>();

  const placeIds = [...new Set(reports.filter((r) => r.entity_type === "place").map((r) => r.entity_id))];
  const trailIds = [...new Set(reports.filter((r) => r.entity_type === "trail").map((r) => r.entity_id))];
  const tripIds = [...new Set(reports.filter((r) => r.entity_type === "trip").map((r) => r.entity_id))];

  const [placesRes, trailsRes, tripsRes] = await Promise.all([
    placeIds.length
      ? supabase.from("places").select("id, name").in("id", placeIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    trailIds.length
      ? supabase.from("trails").select("id, name").in("id", trailIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    tripIds.length
      ? supabase.from("trips").select("id, name").in("id", tripIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);

  for (const row of placesRes.data ?? []) {
    names.set(`place:${row.id}`, row.name);
  }
  for (const row of trailsRes.data ?? []) {
    names.set(`trail:${row.id}`, row.name);
  }
  for (const row of tripsRes.data ?? []) {
    names.set(`trip:${row.id}`, row.name);
  }

  return names;
}

function withEntityNames(reports: Report[], names: Map<string, string>): ReportWithEntityName[] {
  return reports.map((report) => ({
    ...report,
    entity_name: names.get(`${report.entity_type}:${report.entity_id}`) ?? MISSING_ENTITY_NAME,
  }));
}

export async function getEntityName(
  entityType: EntityType,
  entityId: string
): Promise<string> {
  const names = await loadEntityNames([
    {
      id: "",
      user_id: "",
      entity_type: entityType,
      entity_id: entityId,
      report_type: "problem",
      reason: "",
      status: "pending",
      created_at: "",
    },
  ]);
  return names.get(`${entityType}:${entityId}`) ?? MISSING_ENTITY_NAME;
}

export async function getReports(): Promise<ReportWithEntityName[]> {
  const role = await getCurrentRole();
  if (role !== "admin") return [];

  const supabase = createClient();
  const { data, error } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const reports = (data ?? []).map(mapReport);
  const names = await loadEntityNames(reports);
  return withEntityNames(reports, names);
}

export async function createReport(
  entityType: "trip" | "place" | "trail",
  entityId: string,
  reportType: ReportType,
  reason: string
): Promise<Report | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("reports")
    .insert({
      user_id: user.id,
      entity_type: entityType,
      entity_id: entityId,
      report_type: reportType,
      reason,
      status: "pending",
    })
    .select("*")
    .single();

  if (error || !data) return null;
  return mapReport(data);
}

export async function resolveReport(id: string, status: ReportStatus): Promise<Report | null> {
  const role = await getCurrentRole();
  const user = await getCurrentUser();
  if (role !== "admin" || !user) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("reports")
    .update({
      status,
      resolved_at: new Date().toISOString(),
      resolved_by: user.id,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) return null;
  return mapReport(data);
}