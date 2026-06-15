"use client";

import { useEffect, useState } from "react";
import { getAllPlacesAdmin, updatePlaceStatus } from "@/lib/data/places";
import { AdminTable } from "@/components/features/admin/admin-table";
import { StatusTabs } from "@/components/features/admin/status-tabs";
import { PageShell } from "@/components/layout/page-shell";
import { useAuthStore } from "@/hooks/use-stores";
import type { Place, Status } from "@/types";
import { toast } from "@/components/ui/use-toast";

export default function AdminPlacesPage() {
  const { role } = useAuthStore();
  const [places, setPlaces] = useState<Place[]>([]);
  const [tab, setTab] = useState<Status | "all">("all");

  useEffect(() => {
    if (role === "admin") getAllPlacesAdmin().then(setPlaces);
  }, [role]);

  if (role !== "admin") return <PageShell title="ניהול מקומות"><p className="text-center text-muted-foreground py-12">גישה למנהלים בלבד</p></PageShell>;

  const filtered = tab === "all" ? places : places.filter((p) => p.status === tab);

  return (
    <PageShell title="ניהול מקומות" subtitle="אישור ועריכת מקומות">
      <div className="ti-card p-6">
        <StatusTabs value={tab} onChange={setTab}>
          {() => (
            <AdminTable
              items={filtered}
              columns={[
                { key: "name", label: "שם", render: (p) => p.name },
                { key: "region", label: "אזור", render: (p) => p.region },
                { key: "type", label: "סוג", render: (p) => p.place_type },
              ]}
              onApprove={async (id) => { await updatePlaceStatus(id, "approved"); setPlaces(await getAllPlacesAdmin()); toast({ title: "אושר" }); }}
              onReject={async (id) => { await updatePlaceStatus(id, "rejected"); setPlaces(await getAllPlacesAdmin()); toast({ title: "נדחה" }); }}
            />
          )}
        </StatusTabs>
      </div>
    </PageShell>
  );
}
