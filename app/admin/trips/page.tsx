"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminEntityListPage } from "@/components/features/admin/admin-entity-list-page";
import { tripsAdminConfig } from "@/components/features/admin/admin-entity-configs";
import { useAuthStore } from "@/hooks/use-stores";
import {
  deleteTrip,
  getAllTripsAdmin,
  rejectTrip,
  restoreTrip,
  updateTripStatus,
} from "@/lib/data/trips";
import { getUsers } from "@/lib/data/auth";
import type { Trip, User } from "@/types";
import { toast } from "@/components/ui/use-toast";

export default function AdminTripsPage() {
  const { role } = useAuthStore();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [allTrips, allUsers] = await Promise.all([getAllTripsAdmin(), getUsers()]);
    setTrips(allTrips);
    setUsers(allUsers);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (role === "admin") load();
  }, [role, load]);

  if (role !== "admin") return null;

  return (
    <AdminEntityListPage
      config={tripsAdminConfig}
      items={trips}
      users={users}
      loading={loading}
      onApprove={async (item) => {
        await updateTripStatus(item.id, "approved");
        await load();
        toast({ title: "הטיול אושר" });
      }}
      onReject={async (item, reason) => {
        await rejectTrip(item.id, reason);
        await load();
        toast({ title: "הטיול נדחה" });
      }}
      onDelete={async (item) => {
        await deleteTrip(item.id);
        await load();
        toast({ title: "הטיול נמחק" });
      }}
      onRestore={async (item) => {
        await restoreTrip(item.id);
        await load();
        toast({ title: "הטיול הוחזר לבדיקה" });
      }}
    />
  );
}
