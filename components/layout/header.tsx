"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { AuthNav } from "@/components/layout/auth-nav";
import { HeaderSearch } from "@/components/layout/header-search";
import { NotificationBell } from "@/components/features/notifications/notification-bell";
import { Logo } from "@/components/layout/logo";
import { useAuthStore } from "@/hooks/use-stores";
import type { UserRole } from "@/types";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/trips", label: "טיולים" },
  { href: "/places", label: "מקומות" },
  { href: "/trails", label: "מסלולים" },
  { href: "/about", label: "אודות" },
  { href: "/contact", label: "יצירת קשר" },
];

function NavLinks({ pathname, role }: { pathname: string; role: UserRole }) {
  return (
    <>
      {navLinks.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "whitespace-nowrap text-sm font-medium text-foreground/80 transition hover:text-foreground",
            pathname === href && "text-foreground"
          )}
        >
          {label}
        </Link>
      ))}
      {role === "admin" && (
        <Link
          href="/admin"
          className={cn(
            "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition",
            pathname.startsWith("/admin")
              ? "bg-primary text-primary-foreground"
              : "text-foreground/80 hover:bg-muted hover:text-foreground"
          )}
        >
          ניהול
        </Link>
      )}
    </>
  );
}

export function Header() {
  const pathname = usePathname();
  const { role } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const isHome = pathname === "/";

  return (
    <header
      className={cn(
        "z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md",
        isHome ? "fixed inset-x-0 top-0" : "sticky top-0"
      )}
    >
      <div className="ti-container grid h-[72px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 md:gap-x-4">
        {/* עמודה 1 — לוגו */}
        <Logo className="shrink-0" />

        {/* עמודה 2 — ניווט ממורכז / חיפוש פתוח */}
        <div className="min-w-0 justify-self-stretch">
          {searchExpanded ? (
            <div className="lg:hidden">
              <HeaderSearch
                expandable
                expanded={searchExpanded}
                onExpandedChange={setSearchExpanded}
                className="w-full max-w-none"
              />
            </div>
          ) : (
            <nav
              className="hidden min-w-0 justify-center md:flex"
              aria-label="ניווט ראשי"
            >
              <div className="flex max-w-full flex-wrap items-center justify-center gap-x-4 gap-y-1 md:gap-x-5 lg:gap-x-6">
                <NavLinks pathname={pathname} role={role} />
              </div>
            </nav>
          )}
        </div>

        {/* עמודה 3 — חיפוש + משתמש + תפריט (לא חופף לניווט) */}
        <div className="flex shrink-0 items-center justify-end">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden w-40 shrink-0 lg:block xl:w-52">
              <HeaderSearch />
            </div>

            {!searchExpanded && (
              <div className="shrink-0 lg:hidden">
                <HeaderSearch
                  expandable
                  expanded={searchExpanded}
                  onExpandedChange={setSearchExpanded}
                />
              </div>
            )}
          </div>

          <div className="ms-4 flex shrink-0 items-center gap-2 sm:ms-5 sm:gap-3">
            {role !== "guest" && (
              <div className="shrink-0 sm:hidden">
                <NotificationBell />
              </div>
            )}
            <div className="hidden shrink-0 sm:block">
              <NotificationBell />
            </div>
            <div className="hidden shrink-0 sm:block">
              <AuthNav compact />
            </div>

            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="תפריט"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && !searchExpanded && (
        <nav className="border-t border-border/60 md:hidden">
          <div className="px-6 py-4">
            <HeaderSearch />
          </div>
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block px-6 py-3 text-sm hover:bg-muted"
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}
          {role === "admin" && (
            <Link href="/admin" className="block px-6 py-3 text-sm hover:bg-muted" onClick={() => setMobileOpen(false)}>
              ניהול
            </Link>
          )}
          <div className="px-6 py-3 sm:hidden">
            <AuthNav className="w-full justify-center" onNavigate={() => setMobileOpen(false)} />
          </div>
        </nav>
      )}
    </header>
  );
}
