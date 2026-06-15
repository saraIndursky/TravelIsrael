"use client";

import { useEffect, useState } from "react";
import { getReports, resolveReport } from "@/lib/data/reports";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/page-shell";
import { useAuthStore } from "@/hooks/use-stores";
import type { Report } from "@/types";
import { REPORT_TYPE_LABELS } from "@/types/enums";
import { toast } from "@/components/ui/use-toast";

export default function AdminReportsPage() {
  const { role } = useAuthStore();
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    if (role === "admin") getReports().then(setReports);
  }, [role]);

  if (role !== "admin") return <PageShell title="דיווחים"><p className="text-center text-muted-foreground py-12">גישה למנהלים בלבד</p></PageShell>;

  return (
    <PageShell title="דיווחים" subtitle="טיפול בדיווחי משתמשים">
      {reports.length === 0 ? (
        <p className="text-muted-foreground">אין דיווחים</p>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div key={r.id} className="ti-card p-5">
              <p className="font-medium">{r.entity_type} — {r.entity_id}</p>
              <p className="text-sm text-muted-foreground mt-1">
                סוג: {REPORT_TYPE_LABELS[r.report_type] ?? r.report_type}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{r.reason}</p>
              <p className="text-xs text-muted-foreground mt-2">סטטוס: {r.status}</p>
              {r.status === "pending" && (
                <div className="flex gap-2 mt-4">
                  <Button size="sm" className="rounded-xl" onClick={async () => {
                    await resolveReport(r.id, "resolved");
                    setReports(await getReports());
                    toast({ title: "הדיווח טופל" });
                  }}>טפל</Button>
                  <Button size="sm" variant="danger" className="rounded-xl" onClick={async () => {
                    await resolveReport(r.id, "rejected");
                    setReports(await getReports());
                    toast({ title: "הדיווח נדחה" });
                  }}>דחה</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
