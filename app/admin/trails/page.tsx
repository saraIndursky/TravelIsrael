"use client";

import { useMemo } from "react";
import { AdminEntityListPage } from "@/components/features/admin/admin-entity-list-page";
import { trailsAdminConfig } from "@/components/features/admin/admin-entity-configs";
import { useAuthStore } from "@/hooks/use-stores";
import { deleteTrail, removeTrailFromSite, restoreTrail, updateTrailStatus } from "@/lib/data/trails";
import { useAdminEntitySource } from "@/hooks/use-admin-entity-source";
import { mapTrail } from "@/lib/supabase/mappers";
import { isNewTrailType } from "@/lib/utils/trail-types";
import { notifyContentRemoved, notifyContentStatusChange } from "@/lib/notifications/client";
import type { Trail } from "@/types";
import { toast } from "@/components/ui/use-toast";

export default function AdminTrailsPage() {
  const { role } = useAuthStore();
  const { source, refresh: load, types, pendingRegions } = useAdminEntitySource({
    table: "trails",
    map: mapTrail,
    typeColumn: "trail_type",
  });
  const approvedTypes = types.approved;

  const config = useMemo(
    () => trailsAdminConfig(types.all, { approvedTypes, pendingRegions }),
    [types.all, approvedTypes, pendingRegions]
  );

  if (role !== "admin") return null;

  return (
    <AdminEntityListPage
      config={config}
      source={source}
      onApprove={async (item) => {
        const isNewType = isNewTrailType(item.trail_type, approvedTypes);
        const isNewRegion = pendingRegions.includes(item.region);
        await updateTrailStatus(item.id, "approved");
        await notifyContentStatusChange({
          entityType: "trail",
          entityId: item.id,
          entityName: item.name,
          ownerId: item.created_by,
          status: "approved",
          region: item.region,
          regionId: item.region_id,
        });
        await load();
        const added = [
          isNewType ? `סוג המסלול החדש "${item.trail_type}"` : null,
          isNewRegion ? `האזור החדש "${item.region}"` : null,
        ].filter(Boolean);
        toast({
          title: "המסלול אושר",
          description: added.length > 0 ? `${added.join(" ו")} נוספו לרשימה ויופיעו לכולם` : undefined,
        });
      }}
      onReject={async (item, reason) => {
        await updateTrailStatus(item.id, "rejected", reason);
        await notifyContentStatusChange({
          entityType: "trail",
          entityId: item.id,
          entityName: item.name,
          ownerId: item.created_by,
          status: "rejected",
          rejectionReason: reason,
        });
        await load();
        toast({ title: "המסלול נדחה" });
      }}
      onUnpublish={async (item, reason) => {
        await removeTrailFromSite(item.id, reason);
        await notifyContentRemoved({
          entityType: "trail",
          entityId: item.id,
          entityName: item.name,
          ownerId: item.created_by,
          removalReason: reason,
        });
        await load();
        toast({ title: "המסלול הוסר מהאתר" });
      }}
      onDelete={async (item) => {
        try {
          await deleteTrail(item.id);
          await load();
          toast({ title: "המסלול נמחק" });
        } catch (error) {
          toast({
            title: "מחיקה נכשלה",
            description: error instanceof Error ? error.message : undefined,
            variant: "destructive",
          });
        }
      }}
      onRestore={async (item) => {
        await restoreTrail(item.id);
        await load();
        toast({ title: "המסלול הוחזר לבדיקה" });
      }}
    />
  );
}
