"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminEntityListPage } from "@/components/features/admin/admin-entity-list-page";
import { placesAdminConfig } from "@/components/features/admin/admin-entity-configs";
import { useAuthStore } from "@/hooks/use-stores";
import { deletePlace, getAllPlacesAdmin, restorePlace, updatePlaceStatus } from "@/lib/data/places";
import { getUsers } from "@/lib/data/auth";
import type { Place, User } from "@/types";
import { toast } from "@/components/ui/use-toast";

export default function AdminPlacesPage() {
  const { role } = useAuthStore();
  const [places, setPlaces] = useState<Place[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [allPlaces, allUsers] = await Promise.all([getAllPlacesAdmin(), getUsers()]);
    setPlaces(allPlaces);
    setUsers(allUsers);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (role === "admin") load();
  }, [role, load]);

  const config = useMemo(
    () => placesAdminConfig(Array.from(new Set(places.map((p) => p.place_type))).sort()),
    [places]
  );

  if (role !== "admin") return null;

  return (
    <AdminEntityListPage
      config={config}
      items={places}
      users={users}
      loading={loading}
      onApprove={async (item) => {
        await updatePlaceStatus(item.id, "approved");
        await load();
        toast({ title: "המקום אושר" });
      }}
      onReject={async (item, reason) => {
        await updatePlaceStatus(item.id, "rejected", reason);
        await load();
        toast({ title: "המקום נדחה" });
      }}
      onDelete={async (item) => {
        await deletePlace(item.id);
        await load();
        toast({ title: "המקום נמחק" });
      }}
      onRestore={async (item) => {
        await restorePlace(item.id);
        await load();
        toast({ title: "המקום הוחזר לבדיקה" });
      }}
    />
  );
}
