"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminEntityListPage } from "@/components/features/admin/admin-entity-list-page";
import { trailsAdminConfig } from "@/components/features/admin/admin-entity-configs";
import { useAuthStore } from "@/hooks/use-stores";
import { deleteTrail, getAllTrailsAdmin, removeTrailFromSite, restoreTrail, updateTrailStatus } from "@/lib/data/trails";
import { getUsers } from "@/lib/data/auth";
import { getRegions } from "@/lib/data/regions";
import { isNewTrailType } from "@/lib/utils/trail-types";
import { notifyContentRemoved, notifyContentStatusChange } from "@/lib/notifications/client";
import type { Trail, User } from "@/types";
import { toast } from "@/components/ui/use-toast";

export default function AdminTrailsPage() {
  const { role } = useAuthStore();
  const [trails, setTrails] = useState<Trail[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pendingRegions, setPendingRegions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [allTrails, allUsers, allRegions] = await Promise.all([getAllTrailsAdmin(), getUsers(), getRegions()]);
    setTrails(allTrails);
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
    () => Array.from(new Set(trails.filter((t) => t.status === "approved").map((t) => t.trail_type))),
    [trails]
  );

  const config = useMemo(
    () =>
      trailsAdminConfig(Array.from(new Set(trails.map((t) => t.trail_type))).sort(), {
        approvedTypes,
        pendingRegions,
      }),
    [trails, approvedTypes, pendingRegions]
  );

  if (role !== "admin") return null;

  return (
    <AdminEntityListPage
      config={config}
      items={trails}
      users={users}
      loading={loading}
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
