"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminEntityListPage } from "@/components/features/admin/admin-entity-list-page";
import { placesAdminConfig } from "@/components/features/admin/admin-entity-configs";
import { useAuthStore } from "@/hooks/use-stores";
import { deletePlace, getAllPlacesAdmin, removePlaceFromSite, restorePlace, updatePlaceStatus } from "@/lib/data/places";
import { getUsers } from "@/lib/data/auth";
import { getRegions } from "@/lib/data/regions";
import { notifyContentRemoved, notifyContentStatusChange } from "@/lib/notifications/client";
import type { Place, User } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { isNewPlaceType } from "@/lib/utils/place-types";

export default function AdminPlacesPage() {
  const { role } = useAuthStore();
  const [places, setPlaces] = useState<Place[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pendingRegions, setPendingRegions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [allPlaces, allUsers, allRegions] = await Promise.all([getAllPlacesAdmin(), getUsers(), getRegions()]);
    setPlaces(allPlaces);
    setUsers(allUsers);
    setPendingRegions(
      allRegions.filter((r) => r.status === "pending" && r.code).map((r) => r.code as string)
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    if (role === "admin") load();
  }, [role, load]);

  const approvedTypes = useMemo(
    () => Array.from(new Set(places.filter((p) => p.status === "approved").map((p) => p.place_type))),
    [places]
  );

  const config = useMemo(
    () =>
      placesAdminConfig(Array.from(new Set(places.map((p) => p.place_type))).sort(), {
        approvedTypes,
        pendingRegions,
      }),
    [places, approvedTypes, pendingRegions]
  );

  if (role !== "admin") return null;

  return (
    <AdminEntityListPage
      config={config}
      items={places}
      users={users}
      loading={loading}
      onApprove={async (item) => {
        const isNewType = isNewPlaceType(item.place_type, approvedTypes);
        const isNewRegion = pendingRegions.includes(item.region);
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
        const added = [
          isNewType ? `סוג המקום החדש "${item.place_type}"` : null,
          isNewRegion ? `האזור החדש "${item.region}"` : null,
        ].filter(Boolean);
        toast({
          title: "המקום אושר",
          description: added.length > 0 ? `${added.join(" ו")} נוספו לרשימה ויופיעו לכולם` : undefined,
        });
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
