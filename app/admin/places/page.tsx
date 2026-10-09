"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminEntityListPage } from "@/components/features/admin/admin-entity-list-page";
import { placesAdminConfig } from "@/components/features/admin/admin-entity-configs";
import { useAuthStore } from "@/hooks/use-stores";
import { deletePlace, getAllPlacesAdmin, removePlaceFromSite, restorePlace, updatePlaceStatus } from "@/lib/data/places";
import { getUsers } from "@/lib/data/auth";
import { notifyContentRemoved, notifyContentStatusChange } from "@/lib/notifications/client";
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
        await notifyContentStatusChange({
          entityType: "place",
          entityId: item.id,
          entityName: item.name,
          ownerId: item.created_by,
          status: "approved",
          region: item.region,
          regionId: item.region_id,
        });
        await load();
        toast({ title: "המקום אושר" });
      }}
      onReject={async (item, reason) => {
        await updatePlaceStatus(item.id, "rejected", reason);
        await notifyContentStatusChange({
          entityType: "place",
          entityId: item.id,
          entityName: item.name,
          ownerId: item.created_by,
          status: "rejected",
          rejectionReason: reason,
        });
        await load();
        toast({ title: "המקום נדחה" });
      }}
      onUnpublish={async (item, reason) => {
        await removePlaceFromSite(item.id, reason);
        await notifyContentRemoved({
          entityType: "place",
          entityId: item.id,
          entityName: item.name,
          ownerId: item.created_by,
          removalReason: reason,
        });
        await load();
        toast({ title: "המקום הוסר מהאתר" });
      }}
      onDelete={async (item) => {
        try {
          await deletePlace(item.id);
          await load();
          toast({ title: "המקום נמחק" });
        } catch (error) {
          toast({
            title: "מחיקה נכשלה",
            description: error instanceof Error ? error.message : undefined,
            variant: "destructive",
          });
        }
      }}
      onRestore={async (item) => {
        await restorePlace(item.id);
        await load();
        toast({ title: "המקום הוחזר לבדיקה" });
      }}
    />
  );
}
