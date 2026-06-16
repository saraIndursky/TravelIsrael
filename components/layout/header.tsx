"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { AuthNav } from "@/components/layout/auth-nav";
import { Logo } from "@/components/layout/logo";
import { useAuthStore } from "@/hooks/use-stores";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/trips", label: "טיולים" },
  { href: "/places", label: "מקומות" },
  { href: "/trails", label: "מסלולים" },
  { href: "/#about", label: "אודות" },
  { href: "/#contact", label: "יצירת קשר" },
];

export function Header() {
  const pathname = usePathname();
  const { role, setRole } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHome = pathname === "/";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border/60 bg-white/95 backdrop-blur-md",
        isHome && "border-transparent bg-white"
      )}
    >
      <div className="ti-container flex h-[72px] items-center justify-between gap-4">
        <Logo />

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "text-sm font-medium text-foreground/80 transition hover:text-foreground",
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
                "rounded-lg px-3 py-1.5 text-sm font-medium transition",
                pathname.startsWith("/admin")
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/80 hover:bg-muted hover:text-foreground"
              )}
            >
              ניהול
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <AuthNav />
          </div>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "guest" | "user" | "admin")}
            className="h-8 max-w-[88px] rounded-lg border border-border bg-white px-2 text-xs text-muted-foreground"
            title="בורר תפקיד (דמו)"
          >
            <option value="guest">אורח</option>
            <option value="user">משתמש</option>
            <option value="admin">מנהל</option>
          </select>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="תפריט"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border/60 md:hidden">
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
