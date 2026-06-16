"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminEntityListPage } from "@/components/features/admin/admin-entity-list-page";
import { trailsAdminConfig } from "@/components/features/admin/admin-entity-configs";
import { useAuthStore } from "@/hooks/use-stores";
import { deleteTrail, getAllTrailsAdmin, restoreTrail, updateTrailStatus } from "@/lib/data/trails";
import { getUsers } from "@/lib/data/auth";
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
        await load();
        toast({ title: "המסלול אושר" });
      }}
      onReject={async (item, reason) => {
        await updateTrailStatus(item.id, "rejected", reason);
        await load();
        toast({ title: "המסלול נדחה" });
      }}
      onDelete={async (item) => {
        await deleteTrail(item.id);
        await load();
        toast({ title: "המסלול נמחק" });
      }}
      onRestore={async (item) => {
        await restoreTrail(item.id);
        await load();
        toast({ title: "המסלול הוחזר לבדיקה" });
      }}
    />
  );
}
