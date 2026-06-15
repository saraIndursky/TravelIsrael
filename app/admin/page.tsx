"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, Map, MapPin, Route, Flag, Users } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { useAuthStore } from "@/hooks/use-stores";
import { getAllTripsAdmin, updateTripStatus } from "@/lib/data/trips";
import { AdminTable } from "@/components/features/admin/admin-table";
import { StatusTabs } from "@/components/features/admin/status-tabs";
import type { Trip, Status } from "@/types";
import { toast } from "@/components/ui/use-toast";

export default function AdminDashboard() {
  const { role } = useAuthStore();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tab, setTab] = useState<Status | "all">("pending");

  useEffect(() => {
    if (role === "admin") getAllTripsAdmin().then(setTrips);
  }, [role]);

  if (role !== "admin") {
    return (
      <PageShell title="פאנל ניהול" subtitle="גישה מוגבלת">
        <p className="text-center text-muted-foreground py-12">גישה למנהלים בלבד — החלף תפקיד ל״מנהל״ בכותרת</p>
      </PageShell>
    );
  }

  const filtered = tab === "all" ? trips : trips.filter((t) => t.status === tab);

  const links = [
    { href: "/admin/trips", label: "טיולים", icon: Map },
    { href: "/admin/places", label: "מקומות", icon: MapPin },
    { href: "/admin/trails", label: "מסלולים", icon: Route },
    { href: "/admin/reports", label: "דיווחים", icon: Flag },
    { href: "/admin/users", label: "משתמשים", icon: Users },
  ];

  return (
    <PageShell title="פאנל ניהול" subtitle="ניהול תוכן ומשתמשים">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5 mb-10">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="ti-card p-5 flex flex-col items-center gap-2 hover:shadow-md transition">
            <Icon className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium">{label}</span>
          </Link>
        ))}
      </div>

      <div className="ti-card p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Shield className="h-5 w-5" />טיולים ממתינים לאישור</h2>
        <StatusTabs value={tab} onChange={setTab}>
          {() => (
            <AdminTable
              items={filtered}
              columns={[
                { key: "name", label: "שם", render: (t) => t.name },
                { key: "region", label: "אזור", render: (t) => t.region },
                { key: "status", label: "סטטוס", render: (t) => t.status },
              ]}
              onApprove={async (id) => {
                await updateTripStatus(id, "approved");
                setTrips(await getAllTripsAdmin());
                toast({ title: "הטיול אושר" });
              }}
              onReject={async (id) => {
                await updateTripStatus(id, "rejected");
                setTrips(await getAllTripsAdmin());
                toast({ title: "הטיול נדחה" });
              }}
            />
          )}
        </StatusTabs>
      </div>
    </PageShell>
  );
}
