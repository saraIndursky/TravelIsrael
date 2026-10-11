"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminUsersListPage } from "@/components/features/admin/admin-users-list-page";
import { RoleChangeCancelled, RoleChangeDialog } from "@/components/features/admin/role-change-dialog";
import { useAuthStore } from "@/hooks/use-stores";
import {
  currentUserHasPasswordLogin,
  getUsers,
  reauthenticateWithPassword,
  updateUserRole,
} from "@/lib/data/auth";
import type { User, UserRole } from "@/types";

interface PendingChange {
  user: User;
  role: UserRole;
  resolve: () => void;
  reject: (error: Error) => void;
}

export default function AdminUsersPage() {
  const { role } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingChange | null>(null);
  const [hasPassword, setHasPassword] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setUsers(await getUsers());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (role !== "admin") return;
    void load();
    currentUserHasPasswordLogin().then(setHasPassword).catch(() => setHasPassword(true));
  }, [role, load]);

  if (role !== "admin") return null;

  return (
    <>
      <AdminUsersListPage
        users={users}
        loading={loading}
        // The change only happens after the admin confirms in the dialog below.
        onRoleChange={(userId, newRole) =>
          new Promise<void>((resolve, reject) => {
            const user = users.find((candidate) => candidate.id === userId);
            if (!user) {
              reject(new Error("משתמש לא נמצא"));
              return;
            }
            setPending({ user, role: newRole, resolve, reject });
          })
        }
      />

      <RoleChangeDialog
        open={Boolean(pending)}
        user={pending?.user ?? null}
        newRole={pending?.role ?? null}
        needsPassword={hasPassword}
        onCancel={() => {
          pending?.reject(new RoleChangeCancelled());
          setPending(null);
        }}
        onConfirm={async (password) => {
          if (!pending) return;
          if (hasPassword) await reauthenticateWithPassword(password);
          await updateUserRole(pending.user.id, pending.role);
          pending.resolve();
          setPending(null);
          await load();
        }}
      />
    </>
  );
}
