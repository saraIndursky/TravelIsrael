import type { EntityType, Report, ReportStatus, ReportType, ReportWithEntityName } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { mapReport } from "@/lib/supabase/mappers";
import { REPORT_TYPE_LABELS } from "@/components/features/admin/admin-report-labels";
import { ADMIN_PAGE_SIZE, cleanSearchTerm } from "./admin-lists";
import { getCurrentRole, getCurrentUser } from "./auth";
import { pageRange, toPage, type Page } from "./paged";

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

export interface ReportsPageParams {
  status: ReportStatus;
  entityType: EntityType | "";
  search: string;
  page: number;
}

/** Admin: one page of reports (newest first) with the name of the reported content. */
export async function getReportsPage(params: ReportsPageParams): Promise<Page<ReportWithEntityName>> {
  const role = await getCurrentRole();
  if (role !== "admin") return { items: [], total: 0, hasMore: false };

  const supabase = createClient();
  const { from, to } = pageRange(params.page, ADMIN_PAGE_SIZE);
  let query = supabase
    .from("reports")
    .select("*", { count: "exact" })
    .eq("status", params.status)
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .range(from, to);

  if (params.entityType) query = query.eq("entity_type", params.entityType);

  const term = cleanSearchTerm(params.search);
  if (term) {
    const parts = [`reason.ilike.%${term}%`];
    const matchingTypes = Object.entries(REPORT_TYPE_LABELS)
      .filter(([, label]) => label.includes(term))
      .map(([type]) => type);
    if (matchingTypes.length > 0) parts.push(`report_type.in.(${matchingTypes.join(",")})`);

    const named = await Promise.all(
      (["places", "trails", "trips"] as const).map((table) =>
        supabase.from(table).select("id").ilike("name", `%${term}%`).limit(50)
      )
    );
    const ids = named.flatMap((result) => (result.data ?? []).map((row) => row.id as string));
    if (ids.length > 0) parts.push(`entity_id.in.(${ids.join(",")})`);
    query = query.or(parts.join(","));
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  const reports = (data ?? []).map(mapReport);
  const names = await loadEntityNames(reports);
  return toPage(withEntityNames(reports, names), count, params.page, ADMIN_PAGE_SIZE);
}

export async function getReportsCounts(): Promise<Record<ReportStatus | "total", number>> {
  const supabase = createClient();
  const statuses: ReportStatus[] = ["pending", "resolved", "rejected"];
  const results = await Promise.all(
    statuses.map(async (status) => {
      const { count, error } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status", status);
      if (error) throw new Error(error.message);
      return [status, count ?? 0] as const;
    })
  );
  const counts = Object.fromEntries(results) as Record<ReportStatus, number>;
  return { ...counts, total: counts.pending + counts.resolved + counts.rejected };
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