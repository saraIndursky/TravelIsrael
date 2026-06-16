"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminReportsListPage } from "@/components/features/admin/admin-reports-list-page";
import { useAuthStore } from "@/hooks/use-stores";
import { getReports, resolveReport } from "@/lib/data/reports";
import type { Report } from "@/types";
import { toast } from "@/components/ui/use-toast";

export default function AdminReportsPage() {
  const { role } = useAuthStore();
  const [reports, setReports] = useState<Report[]>([]);
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

  return (
    <AdminReportsListPage
      reports={reports}
      loading={loading}
      onResolve={async (id) => {
        await resolveReport(id, "resolved");
        await load();
        toast({ title: "הדיווח טופל" });
      }}
      onReject={async (id) => {
        await resolveReport(id, "rejected");
        await load();
        toast({ title: "הדיווח נדחה" });
      }}
    />
  );
}
