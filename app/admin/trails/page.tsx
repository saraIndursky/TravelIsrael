"use client";

import { useEffect, useState } from "react";
import { getAllTrailsAdmin, updateTrailStatus } from "@/lib/data/trails";
import { AdminTable } from "@/components/features/admin/admin-table";
import { StatusTabs } from "@/components/features/admin/status-tabs";
import { PageShell } from "@/components/layout/page-shell";
import { useAuthStore } from "@/hooks/use-stores";
import type { Trail, Status } from "@/types";
import { toast } from "@/components/ui/use-toast";

export default function AdminTrailsPage() {
  const { role } = useAuthStore();
  const [trails, setTrails] = useState<Trail[]>([]);
  const [tab, setTab] = useState<Status | "all">("all");

  useEffect(() => {
    if (role === "admin") getAllTrailsAdmin().then(setTrails);
  }, [role]);

  if (role !== "admin") return <PageShell title="ניהול מסלולים"><p className="text-center text-muted-foreground py-12">גישה למנהלים בלבד</p></PageShell>;

  const filtered = tab === "all" ? trails : trails.filter((t) => t.status === tab);

  return (
    <PageShell title="ניהול מסלולים" subtitle="אישור ועריכת מסלולים">
      <div className="ti-card p-6">
        <StatusTabs value={tab} onChange={setTab}>
          {() => (
            <AdminTable
              items={filtered}
              columns={[
                { key: "name", label: "שם", render: (t) => t.name },
                { key: "region", label: "אזור", render: (t) => t.region },
                { key: "difficulty", label: "קושי", render: (t) => t.difficulty },
              ]}
              onApprove={async (id) => { await updateTrailStatus(id, "approved"); setTrails(await getAllTrailsAdmin()); toast({ title: "אושר" }); }}
              onReject={async (id) => { await updateTrailStatus(id, "rejected"); setTrails(await getAllTrailsAdmin()); toast({ title: "נדחה" }); }}
            />
          )}
        </StatusTabs>
      </div>
    </PageShell>
  );
}
