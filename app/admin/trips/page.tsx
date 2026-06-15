"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllTripsAdmin, updateTripStatus, deleteTrip } from "@/lib/data/trips";
import { AdminTable } from "@/components/features/admin/admin-table";
import { StatusTabs } from "@/components/features/admin/status-tabs";
import { PageShell } from "@/components/layout/page-shell";
import { useAuthStore } from "@/hooks/use-stores";
import type { Trip, Status } from "@/types";
import { toast } from "@/components/ui/use-toast";

export default function AdminTripsPage() {
  const { role } = useAuthStore();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tab, setTab] = useState<Status | "all">("all");

  useEffect(() => {
    if (role === "admin") getAllTripsAdmin().then(setTrips);
  }, [role]);

  if (role !== "admin") return <PageShell title="ניהול טיולים"><p className="text-center text-muted-foreground py-12">גישה למנהלים בלבד</p></PageShell>;

  const filtered = tab === "all" ? trips : trips.filter((t) => t.status === tab);

  return (
    <PageShell title="ניהול טיולים" subtitle="אישור ועריכת טיולים">
      <div className="ti-card p-6">
        <StatusTabs value={tab} onChange={setTab}>
          {() => (
            <AdminTable
              items={filtered}
              columns={[
                { key: "name", label: "שם", render: (t) => t.name },
                { key: "region", label: "אזור", render: (t) => t.region },
                { key: "creator", label: "יוצר", render: (t) => t.created_by },
              ]}
              onApprove={async (id) => { await updateTripStatus(id, "approved"); setTrips(await getAllTripsAdmin()); toast({ title: "אושר" }); }}
              onReject={async (id) => { await updateTripStatus(id, "rejected"); setTrips(await getAllTripsAdmin()); toast({ title: "נדחה" }); }}
              onEdit={(id) => router.push(`/trips/${id}/edit`)}
              onDelete={async (id) => { await deleteTrip(id); setTrips(await getAllTripsAdmin()); toast({ title: "נמחק" }); }}
            />
          )}
        </StatusTabs>
      </div>
    </PageShell>
  );
}
