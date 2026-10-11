"use client";

import { useState } from "react";
import { AdminReportsListPage } from "@/components/features/admin/admin-reports-list-page";
import { useAuthStore } from "@/hooks/use-stores";
import { resolveReport } from "@/lib/data/reports";
import { notifyReportStatusChange } from "@/lib/notifications/client";
import type { ReportWithEntityName } from "@/types";
import { toast } from "@/components/ui/use-toast";

export default function AdminReportsPage() {
  const { role } = useAuthStore();
  const [version, setVersion] = useState(0);

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

    setVersion((current) => current + 1);
    toast({ title: status === "resolved" ? "הדיווח טופל" : "הדיווח נדחה" });
  }

  return (
    <AdminReportsListPage
      version={version}
      onResolve={(report) => handleStatusChange(report, "resolved")}
      onReject={(report) => handleStatusChange(report, "rejected")}
    />
  );
}
