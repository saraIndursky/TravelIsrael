"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Shield, X } from "lucide-react";
import { ADMIN_NAV } from "@/components/features/admin/admin-nav";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/hooks/use-stores";
import { MODERATION_QUEUE_CHANGED_EVENT } from "@/lib/data/moderation";
import { CONTACT_CHANGED_EVENT } from "@/lib/data/contact";
import { getQueueSummary, type QueueSummary } from "@/lib/data/admin-dashboard";
import { ageInDays, urgencyTone, type UrgencyTone } from "@/lib/utils/admin-urgency";

// badge colours from green (nothing waits long) to red (waiting too long)
const TONE_STYLES: Record<UrgencyTone, string> = {
  green: "bg-emerald-700 text-white",
  yellow: "bg-yellow-400 text-yellow-950",
  orange: "bg-orange-600 text-white",
  red: "bg-red-600 text-white",
};

/** Which queue (and how urgent it is) each menu item shows. */
const QUEUE_FOR_HREF: Record<string, { key: keyof QueueSummary["counts"]; urgent: boolean }> = {
  "/admin/trips": { key: "trips", urgent: false },
  "/admin/places": { key: "places", urgent: false },
  "/admin/trails": { key: "trails", urgent: false },
  "/admin/reports": { key: "reports", urgent: true },
  "/admin/moderation": { key: "moderation", urgent: false },
  "/admin/messages": { key: "messages", urgent: true },
};

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AdminSidebar({ mobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { role } = useAuthStore();
  const [summary, setSummary] = useState<QueueSummary | null>(null);

  useEffect(() => {
    if (role !== "admin") {
      setSummary(null);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const result = await getQueueSummary();
        if (!cancelled) setSummary(result);
      } catch {
        if (!cancelled) setSummary(null);
      }
    }

    void load();
    const onChange = () => {
      void load();
    };
    window.addEventListener(MODERATION_QUEUE_CHANGED_EVENT, onChange);
    window.addEventListener(CONTACT_CHANGED_EVENT, onChange);
    window.addEventListener("focus", onChange);
    return () => {
      cancelled = true;
      window.removeEventListener(MODERATION_QUEUE_CHANGED_EVENT, onChange);
      window.removeEventListener(CONTACT_CHANGED_EVENT, onChange);
      window.removeEventListener("focus", onChange);
    };
  }, [role, pathname]);

  const badge = (href: string): { count: number; tone: UrgencyTone } | null => {
    const queue = QUEUE_FOR_HREF[href];
    if (!queue || !summary) return null;
    const count = summary.counts[queue.key];
    if (count <= 0) return null;
    return { count, tone: urgencyTone(ageInDays(summary.oldest[queue.key]), queue.urgent) };
  };

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const navContent = (
    <>
      <div className="flex items-center gap-3 border-b border-border/60 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Shield className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">פאנל ניהול</p>
          <p className="text-xs text-muted-foreground">TravelIsrael</p>
        </div>
        {onMobileClose && (
          <button
            type="button"
            onClick={onMobileClose}
            className="mr-auto inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border md:hidden"
            aria-label="סגור תפריט"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-3" aria-label="ניווט ניהול">
        {ADMIN_NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onMobileClose}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              isActive(href)
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-foreground/80 hover:bg-muted hover:text-foreground"
            )}
            aria-current={isActive(href) ? "page" : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="flex-1">{label}</span>
            {(() => {
              const info = badge(href);
              if (!info) return null;
              return (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                    TONE_STYLES[info.tone],
                    isActive(href) && "ring-2 ring-primary-foreground/70"
                  )}
                >
                  {info.count > 99 ? "99+" : info.count}
                </span>
              );
            })()}
          </Link>
        ))}
      </nav>

      <div className="border-t border-border/60 p-3">
        <Link
          href="/"
          onClick={onMobileClose}
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4" aria-hidden />
          חזרה לאתר
        </Link>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden w-60 shrink-0 flex-col border-l border-border/60 bg-white md:flex">
        {navContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="תפריט ניהול">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={onMobileClose}
            aria-label="סגור תפריט"
          />
          <aside className="absolute inset-y-0 right-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
