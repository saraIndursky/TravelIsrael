"use client";

import { useMemo } from "react";
import { AdminEntityListPage } from "@/components/features/admin/admin-entity-list-page";
import { placesAdminConfig } from "@/components/features/admin/admin-entity-configs";
import { useAuthStore } from "@/hooks/use-stores";
import { deletePlace, removePlaceFromSite, restorePlace, updatePlaceStatus } from "@/lib/data/places";
import { useAdminEntitySource } from "@/hooks/use-admin-entity-source";
import { mapPlace } from "@/lib/supabase/mappers";
import { notifyContentRemoved, notifyContentStatusChange } from "@/lib/notifications/client";
import type { Place } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { isNewPlaceType } from "@/lib/utils/place-types";

export default function AdminPlacesPage() {
  const { role } = useAuthStore();
  const { source, refresh: load, types, pendingRegions } = useAdminEntitySource({
    table: "places",
    map: mapPlace,
    typeColumn: "place_type",
  });
  const approvedTypes = types.approved;

  const config = useMemo(
    () => placesAdminConfig(types.all, { approvedTypes, pendingRegions }),
    [types.all, approvedTypes, pendingRegions]
  );

  if (role !== "admin") return null;

  return (
    <AdminEntityListPage
      config={config}
      source={source}
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
