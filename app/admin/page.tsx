"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flag, Inbox, Map, MapPin, Route } from "lucide-react";
import { AdminPageHeader } from "@/components/features/admin/admin-page-header";
import { AdminStatCard } from "@/components/features/admin/admin-stat-card";
import { ADMIN_NAV } from "@/components/features/admin/admin-nav";
import { useAuthStore } from "@/hooks/use-stores";
import { getAllTripsAdmin } from "@/lib/data/trips";
import { getAllPlacesAdmin } from "@/lib/data/places";
import { getAllTrailsAdmin } from "@/lib/data/trails";
import { getReports } from "@/lib/data/reports";
import { getNewContactCount } from "@/lib/data/contact";

export default function AdminDashboard() {
  const { role } = useAuthStore();
  const [pendingCounts, setPendingCounts] = useState({ trips: 0, places: 0, trails: 0, reports: 0, messages: 0 });

  useEffect(() => {
    if (role !== "admin") return;

    Promise.all([
      getAllTripsAdmin(),
      getAllPlacesAdmin(),
      getAllTrailsAdmin(),
      getReports(),
      getNewContactCount().catch(() => 0),
    ]).then(
      ([allTrips, places, trails, reports, messages]) => {
        setPendingCounts({
          trips: allTrips.filter((t) => t.status === "pending").length,
          places: places.filter((p) => p.status === "pending").length,
          trails: trails.filter((t) => t.status === "pending").length,
          reports: reports.filter((r) => r.status === "pending").length,
          messages,
        });
      }
    );
  }, [role]);

  if (role !== "admin") return null;

  const quickLinks = ADMIN_NAV.filter((item) => item.href !== "/admin");

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <AdminPageHeader title="לוח בקרה" subtitle="סקירה וניהול תוכן" />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard label="טיולים ממתינים" value={pendingCounts.trips} href="/admin/trips" icon={Map} highlight />
        <AdminStatCard label="מקומות ממתינים" value={pendingCounts.places} href="/admin/places" icon={MapPin} highlight />
        <AdminStatCard label="מסלולים ממתינים" value={pendingCounts.trails} href="/admin/trails" icon={Route} highlight />
        <AdminStatCard label="דיווחים פתוחים" value={pendingCounts.reports} href="/admin/reports" icon={Flag} highlight />
        <AdminStatCard label="פניות חדשות" value={pendingCounts.messages} href="/admin/messages" icon={Inbox} highlight />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {quickLinks.map(({ href, label, icon: Icon, description }) => (
          <Link
            key={href}
            href={href}
            className="ti-card group p-4 transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/5 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="h-4 w-4" aria-hidden />
            </div>
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
