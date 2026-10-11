"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Filter, Search, Shield, User as UserIcon, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { User, UserRole } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { CenteredPageLoading } from "@/components/layout/page-loading";

interface AdminUsersListPageProps {
  users: User[];
  loading?: boolean;
  onRoleChange: (userId: string, role: UserRole) => Promise<void>;
}

const roleLabel: Record<UserRole, string> = {
  guest: "אורח",
  user: "משתמש",
  admin: "מנהל",
};

export function AdminUsersListPage({ users, loading, onRoleChange }: AdminUsersListPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "">("");

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = searchTerm.trim();
      const matchesSearch = !q || u.name.includes(q) || u.email.includes(q);
      const matchesRole = !filterRole || u.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  if (loading) {
    return <CenteredPageLoading />;
  }

  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount = users.filter((u) => u.role === "user").length;

  return (
    <div className="min-h-full bg-secondary/30">
      <div className="border-b border-border/60 bg-white">
        <div className="px-4 py-6 md:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-light tracking-tight text-foreground md:text-3xl">משתמשים</h1>
            <p className="mt-1 text-sm text-muted-foreground">ניהול תפקידי משתמשים במערכת</p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            <StatBox value={users.length} label='סה"כ משתמשים' variant="info" />
            <StatBox value={adminCount} label="מנהלים" variant="success" />
            <StatBox value={userCount} label="משתמשים רגילים" variant="warning" />
            <StatBox value={filtered.length} label="תוצאות מסוננות" variant="danger" />
          </div>
        </div>
      </div>

      <div className="border-b border-border/60 bg-white">
        <div className="px-4 py-4 md:px-8">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                type="search"
                placeholder="חיפוש לפי שם או אימייל..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ti-input pr-10"
              />
            </div>
            <select
              aria-label="תפקיד"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as UserRole | "")}
              className="ti-select w-full"
            >
              <option value="">כל התפקידים</option>
              <option value="user">{roleLabel.user}</option>
              <option value="admin">{roleLabel.admin}</option>
            </select>
          </div>
          {(searchTerm || filterRole) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">סינונים פעילים:</span>
              {searchTerm && <FilterChip label={`חיפוש: ${searchTerm}`} onClear={() => setSearchTerm("")} />}
              {filterRole && <FilterChip label={`תפקיד: ${roleLabel[filterRole]}`} onClear={() => setFilterRole("")} />}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-6 md:px-8">
        <p className="mb-4 text-sm text-muted-foreground">
          מציג {filtered.length} מתוך {users.length} משתמשים
        </p>

        <div className="overflow-hidden rounded-xl border border-border/60 bg-white">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border/60 bg-muted/30">
                <tr>
                  <th className="px-4 py-4 text-right text-sm font-medium text-muted-foreground">משתמש</th>
                  <th className="px-4 py-4 text-right text-sm font-medium text-muted-foreground">אימייל</th>
                  <th className="px-4 py-4 text-right text-sm font-medium text-muted-foreground">תפקיד</th>
                  <th className="px-4 py-4 text-right text-sm font-medium text-muted-foreground">הצטרפות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((u) => (
                  <tr key={u.id} className="transition hover:bg-muted/20">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted">
                          {u.avatar_url ? (
                            <Image src={u.avatar_url} alt="" fill className="object-cover" sizes="40px" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <UserIcon className="h-5 w-5 text-muted-foreground" aria-hidden />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          {u.role === "admin" && (
                            <Badge variant="default" className="mt-1">
                              <Shield className="ml-1 h-3 w-3" aria-hidden />
                              מנהל
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-4">
                      <select
                        className="ti-select h-9 min-w-[120px]"
                        value={u.role}
                        aria-label={`תפקיד עבור ${u.name}`}
                        onChange={async (e) => {
                          const newRole = e.target.value as UserRole;
                          try {
                            await onRoleChange(u.id, newRole);
                            toast({ title: "התפקיד עודכן" });
                          } catch (error) {
                            if (error instanceof Error && error.name === "RoleChangeCancelled") return;
                            toast({
                              title: "עדכון התפקיד נכשל",
                              description: error instanceof Error ? error.message : undefined,
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        <option value="user">{roleLabel.user}</option>
                        <option value="admin">{roleLabel.admin}</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString("he-IL") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-border/60 md:hidden">
            {filtered.map((u) => (
              <div key={u.id} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full bg-muted">
                    {u.avatar_url ? (
                      <Image src={u.avatar_url} alt="" fill className="object-cover" sizes="48px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <UserIcon className="h-5 w-5 text-muted-foreground" aria-hidden />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{u.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{u.email}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <select
                    className="ti-select h-9 w-full"
                    value={u.role}
                    aria-label={`תפקיד עבור ${u.name}`}
                    onChange={async (e) => {
                      const newRole = e.target.value as UserRole;
                      try {
                        await onRoleChange(u.id, newRole);
                        toast({ title: "התפקיד עודכן" });
                      } catch (error) {
                        if (error instanceof Error && error.name === "RoleChangeCancelled") return;
                        toast({
                          title: "עדכון התפקיד נכשל",
                          description: error instanceof Error ? error.message : undefined,
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <option value="user">{roleLabel.user}</option>
                    <option value="admin">{roleLabel.admin}</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <Filter className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" aria-hidden />
              <p className="text-muted-foreground">לא נמצאו משתמשים</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({
  value,
  label,
  variant,
}: {
  value: number;
  label: string;
  variant: "success" | "warning" | "danger" | "info";
}) {
  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    danger: "border-red-200 bg-red-50 text-red-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  };
  const valueStyles = {
    success: "text-emerald-700",
    warning: "text-amber-700",
    danger: "text-red-700",
    info: "text-blue-700",
  };

  return (
    <div className={`rounded-xl border p-4 ${styles[variant]}`}>
      <div className={`text-2xl font-bold tabular-nums ${valueStyles[variant]}`}>{value}</div>
      <div className="text-sm">{label}</div>
    </div>
  );
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm">
      <span>{label}</span>
      <button type="button" onClick={onClear} aria-label="הסר סינון">
        <X className="h-3 w-3 text-muted-foreground" />
      </button>
    </div>
  );
}
