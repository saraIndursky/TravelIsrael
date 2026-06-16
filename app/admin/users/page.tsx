"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminUsersListPage } from "@/components/features/admin/admin-users-list-page";
import { useAuthStore } from "@/hooks/use-stores";
import { getUsers, updateUserRole } from "@/lib/data/auth";
import type { User, UserRole } from "@/types";

export default function AdminUsersPage() {
  const { role } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setUsers(await getUsers());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (role === "admin") load();
  }, [role, load]);

  if (role !== "admin") return null;

  return (
    <AdminUsersListPage
      users={users}
      loading={loading}
      onRoleChange={async (userId, newRole) => {
        await updateUserRole(userId, newRole);
        await load();
      }}
    />
  );
}
