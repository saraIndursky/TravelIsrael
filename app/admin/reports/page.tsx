"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminReportsListPage } from "@/components/features/admin/admin-reports-list-page";
import { useAuthStore } from "@/hooks/use-stores";
import { getReports, resolveReport } from "@/lib/data/reports";
import { notifyReportStatusChange } from "@/lib/notifications/client";
import type { ReportWithEntityName } from "@/types";
import { toast } from "@/components/ui/use-toast";

export default function AdminReportsPage() {
  const { role } = useAuthStore();
  const [reports, setReports] = useState<ReportWithEntityName[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setReports(await getReports());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (role === "admin") load();
  }, [role, load]);

  if (role !== "admin") return null;

  async function handleStatusChange(
    report: ReportWithEntityName,
    status: "resolved" | "rejected"
  ) {
    const updated = await resolveReport(report.id, status);
    if (!updated) {
      toast({ title: "עדכון הדיווח נכשל", variant: "destructive" });
      return;
    }

    await notifyReportStatusChange({
      reportId: report.id,
      reporterId: report.user_id,
      entityType: report.entity_type,
      entityId: report.entity_id,
      entityName: report.entity_name,
      status,
    });

    await load();
    toast({ title: status === "resolved" ? "הדיווח טופל" : "הדיווח נדחה" });
  }

  return (
    <AdminReportsListPage
      reports={reports}
      loading={loading}
      onResolve={async (id) => {
        const report = reports.find((r) => r.id === id);
        if (!report) return;
        await handleStatusChange(report, "resolved");
      }}
      onReject={async (id) => {
        const report = reports.find((r) => r.id === id);
        if (!report) return;
        await handleStatusChange(report, "rejected");
      }}
    />
  );
}
