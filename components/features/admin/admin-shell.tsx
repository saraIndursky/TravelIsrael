"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { AdminSidebar } from "@/components/features/admin/admin-sidebar";
import { AdminAccessGate } from "@/components/features/admin/admin-access-gate";
import { useAuthStore } from "@/hooks/use-stores";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { role } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-72px)] bg-secondary/40">
      <AdminSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-border/60 bg-white px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border"
            aria-label="פתח תפריט ניהול"
          >
            <Menu className="h-5 w-5" />
          </button>
          <p className="text-sm font-semibold text-foreground">פאנל ניהול</p>
        </div>

        <div className="flex-1 overflow-auto">
          {role === "admin" ? children : (
            <div className="px-4 py-6 md:px-8 md:py-8">
              <AdminAccessGate />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
