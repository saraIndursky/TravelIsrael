"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [bar, setBar] = useState<{ left: number; width: number; top: number } | null>(null);
  const [animate, setAnimate] = useState(false);

  // a detail page such as /trips/abc keeps "טיולים" marked
  const activeHref = navLinks.find(({ href }) => pathname === href || pathname.startsWith(`${href}/`))?.href ?? null;

  const measure = useCallback(() => {
    const link = activeHref ? linkRefs.current[activeHref] : null;
    setBar(link ? { left: link.offsetLeft, width: link.offsetWidth, top: link.offsetTop + link.offsetHeight } : null);
  }, [activeHref]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    // the bar only slides after the first paint, so it doesn't fly in from the corner on load
    const frame = requestAnimationFrame(() => setAnimate(true));
    window.addEventListener("resize", measure);
    void document.fonts?.ready.then(measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  return (
    <div
      ref={containerRef}
      className="relative flex max-w-full flex-wrap items-center justify-center gap-x-4 gap-y-1 md:gap-x-5 lg:gap-x-6"
    >
      {navLinks.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          ref={(node) => {
            linkRefs.current[href] = node;
          }}
          aria-current={activeHref === href ? "page" : undefined}
          className={cn(
            "whitespace-nowrap text-sm font-medium text-foreground/80 transition hover:text-foreground",
            activeHref === href && "font-semibold text-foreground"
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
      {/* the sliding line that shows where the visitor is */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute h-[3px] rounded-full bg-primary",
          animate && "transition-[left,width,top,opacity] duration-300 ease-out"
        )}
        style={{
          left: bar?.left ?? 0,
          width: bar?.width ?? 0,
          top: (bar?.top ?? 0) + 4,
          opacity: bar ? 1 : 0,
        }}
      />
    </div>
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
        {/* Column 1 — logo */}
        <Logo className="shrink-0" />

        {/* Column 2 — centered navigation / open search */}
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
              <NavLinks pathname={pathname} role={role} />
            </nav>
          )}
        </div>

        {/* Column 3 — search + user + menu (does not overlap the navigation) */}
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
