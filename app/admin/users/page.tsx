"use client";

import { useEffect, useState } from "react";
import { AdminUsersListPage } from "@/components/features/admin/admin-users-list-page";
import { RoleChangeCancelled, RoleChangeDialog } from "@/components/features/admin/role-change-dialog";
import { useAuthStore } from "@/hooks/use-stores";
import { currentUserHasPasswordLogin, reauthenticateWithPassword, updateUserRole } from "@/lib/data/auth";
import type { User, UserRole } from "@/types";

interface PendingChange {
  user: User;
  role: UserRole;
  resolve: () => void;
  reject: (error: Error) => void;
}

export default function AdminUsersPage() {
  const { role } = useAuthStore();
  const [version, setVersion] = useState(0);
  const [pending, setPending] = useState<PendingChange | null>(null);
  const [hasPassword, setHasPassword] = useState(true);

  useEffect(() => {
    if (role !== "admin") return;
    currentUserHasPasswordLogin().then(setHasPassword).catch(() => setHasPassword(true));
  }, [role]);

  if (role !== "admin") return null;

  return (
    <>
      <AdminUsersListPage
        version={version}
        // The change only happens after the admin confirms in the dialog below.
        onRoleChange={(user, newRole) =>
          new Promise<void>((resolve, reject) => {
            setPending({ user, role: newRole, resolve, reject });
          }).finally(() => setVersion((current) => current + 1))
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
        }}
      />
    </>
  );
}
