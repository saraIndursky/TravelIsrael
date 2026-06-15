import type { Report, ReportStatus, ReportType } from "@/types";
import { getCurrentRole, getCurrentUser } from "./auth";
import { generateId, getStore, updateStore } from "./store";

export async function getReports(): Promise<Report[]> {
  const role = await getCurrentRole();
  if (role !== "admin") return [];
  return getStore().reports;
}

export async function createReport(
  entityType: "trip" | "place" | "trail",
  entityId: string,
  reportType: ReportType,
  reason: string
): Promise<Report | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const report: Report = {
    id: generateId("rep"),
    user_id: user.id,
    entity_type: entityType,
    entity_id: entityId,
    report_type: reportType,
    reason,
    status: "pending",
    created_at: new Date().toISOString(),
  };

  updateStore((s) => ({ ...s, reports: [...s.reports, report] }));
  return report;
}

export async function resolveReport(
  id: string,
  status: ReportStatus
): Promise<Report | null> {
  const role = await getCurrentRole();
  const user = await getCurrentUser();
  if (role !== "admin" || !user) return null;

  updateStore((s) => ({
    ...s,
    reports: s.reports.map((r) =>
      r.id === id
        ? {
            ...r,
            status,
            resolved_at: new Date().toISOString(),
            resolved_by: user.id,
          }
        : r
    ),
  }));

  return getStore().reports.find((r) => r.id === id) ?? null;
}
