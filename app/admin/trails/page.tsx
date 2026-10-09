"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminEntityListPage } from "@/components/features/admin/admin-entity-list-page";
import { trailsAdminConfig } from "@/components/features/admin/admin-entity-configs";
import { useAuthStore } from "@/hooks/use-stores";
import { deleteTrail, getAllTrailsAdmin, removeTrailFromSite, restoreTrail, updateTrailStatus } from "@/lib/data/trails";
import { getUsers } from "@/lib/data/auth";
import { notifyContentRemoved, notifyContentStatusChange } from "@/lib/notifications/client";
import type { Trail, User } from "@/types";
import { toast } from "@/components/ui/use-toast";

export default function AdminTrailsPage() {
  const { role } = useAuthStore();
  const [trails, setTrails] = useState<Trail[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [allTrails, allUsers] = await Promise.all([getAllTrailsAdmin(), getUsers()]);
    setTrails(allTrails);
    setUsers(allUsers);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (role === "admin") load();
  }, [role, load]);

  const config = useMemo(
    () => trailsAdminConfig(Array.from(new Set(trails.map((t) => t.trail_type))).sort()),
    [trails]
  );

  if (role !== "admin") return null;

  return (
    <AdminEntityListPage
      config={config}
      items={trails}
      users={users}
      loading={loading}
      onApprove={async (item) => {
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
        toast({ title: "המסלול אושר" });
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
