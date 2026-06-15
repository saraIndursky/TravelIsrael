"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { Trip } from "@/types";
import { TripCard } from "@/components/features/trips/trip-card";
import { StatusTabs } from "@/components/features/admin/status-tabs";
import { PageShell } from "@/components/layout/page-shell";
import { getTrips } from "@/lib/data/trips";
import { getFavoriteTrips } from "@/lib/data/favorites";
import { useAuthStore } from "@/hooks/use-stores";
import type { Status } from "@/types";

export default function ProfilePage() {
  const { role, userId } = useAuthStore();
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [favorites, setFavorites] = useState<Trip[]>([]);
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");

  useEffect(() => {
    if (role === "guest") return;
    getTrips({ createdBy: userId }).then(({ trips }) => setMyTrips(trips));
    getFavoriteTrips().then(setFavorites);
  }, [role, userId]);

  if (role === "guest") {
    return (
      <PageShell title="אזור אישי" subtitle="התחברות נדרשת">
        <div className="text-center py-12 space-y-4">
          <p className="text-muted-foreground">התחבר כמשתמש כדי לראות את האזור האישי</p>
          <p className="text-sm text-muted-foreground">לחצי על ״התחבר״ בכותרת העמוד</p>
        </div>
      </PageShell>
    );
  }

  const counts = {
    all: myTrips.length,
    draft: myTrips.filter((t) => t.status === "draft").length,
    pending: myTrips.filter((t) => t.status === "pending").length,
    approved: myTrips.filter((t) => t.status === "approved").length,
    rejected: myTrips.filter((t) => t.status === "rejected").length,
  };

  return (
    <PageShell
      title="אזור אישי"
      subtitle="הטיולים והמועדפים שלך"
      action={<Link href="/trips/create" className="ti-btn-primary text-sm">צור טיול</Link>}
    >
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">הטיולים שלי</h2>
        <StatusTabs value={statusFilter} onChange={setStatusFilter} counts={counts}>
          {(status) => (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(status === "all" ? myTrips : myTrips.filter((t) => t.status === status)).map((t) => (
                <TripCard key={t.id} trip={t} />
              ))}
              {myTrips.length === 0 && <p className="text-muted-foreground col-span-full">אין טיולים</p>}
            </div>
          )}
        </StatusTabs>
      </section>

      <section>
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4"><Heart className="h-5 w-5" />מועדפים</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((t) => <TripCard key={t.id} trip={t} showFavorite />)}
          {favorites.length === 0 && <p className="text-muted-foreground">אין מועדפים</p>}
        </div>
      </section>
    </PageShell>
  );
}
