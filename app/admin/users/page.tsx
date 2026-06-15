"use client";

import { useEffect, useState } from "react";
import { getUsers, updateUserRole } from "@/lib/data/auth";
import { PageShell } from "@/components/layout/page-shell";
import { useAuthStore } from "@/hooks/use-stores";
import type { User, UserRole } from "@/types";
import { toast } from "@/components/ui/use-toast";

export default function AdminUsersPage() {
  const { role } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (role === "admin") getUsers().then(setUsers);
  }, [role]);

  if (role !== "admin") return <PageShell title="משתמשים"><p className="text-center text-muted-foreground py-12">גישה למנהלים בלבד</p></PageShell>;

  return (
    <PageShell title="משתמשים" subtitle="ניהול תפקידי משתמשים">
      <div className="ti-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-5 py-4 text-right font-medium">שם</th>
              <th className="px-5 py-4 text-right font-medium">אימייל</th>
              <th className="px-5 py-4 text-right font-medium">תפקיד</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border/60">
                <td className="px-5 py-4">{u.name}</td>
                <td className="px-5 py-4 text-muted-foreground">{u.email}</td>
                <td className="px-5 py-4">
                  <select
                    className="ti-select h-9"
                    value={u.role}
                    onChange={async (e) => {
                      await updateUserRole(u.id, e.target.value as UserRole);
                      setUsers(await getUsers());
                      toast({ title: "התפקיד עודכן" });
                    }}
                  >
                    <option value="user">משתמש</option>
                    <option value="admin">מנהל</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
