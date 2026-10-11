"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Shield, X } from "lucide-react";
import { ADMIN_NAV } from "@/components/features/admin/admin-nav";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/hooks/use-stores";
import {
  getUnseenModerationCount,
  MODERATION_QUEUE_CHANGED_EVENT,
} from "@/lib/data/moderation";
import { CONTACT_CHANGED_EVENT, getNewContactCount } from "@/lib/data/contact";

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AdminSidebar({ mobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { role } = useAuthStore();
  const [moderationCount, setModerationCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);

  useEffect(() => {
    if (role !== "admin") {
      setModerationCount(0);
      setMessagesCount(0);
      return;
    }

    let cancelled = false;

    async function loadCount() {
      try {
        const count = await getUnseenModerationCount();
        if (!cancelled) setModerationCount(count);
      } catch {
        if (!cancelled) setModerationCount(0);
      }
    }

    async function loadMessages() {
      try {
        const count = await getNewContactCount();
        if (!cancelled) setMessagesCount(count);
      } catch {
        if (!cancelled) setMessagesCount(0);
      }
    }

    void loadCount();
    void loadMessages();
    const onChange = () => {
      void loadCount();
    };
    const onMessagesChange = () => {
      void loadMessages();
    };
    window.addEventListener(MODERATION_QUEUE_CHANGED_EVENT, onChange);
    window.addEventListener(CONTACT_CHANGED_EVENT, onMessagesChange);
    window.addEventListener("focus", onChange);
    window.addEventListener("focus", onMessagesChange);
    return () => {
      cancelled = true;
      window.removeEventListener(MODERATION_QUEUE_CHANGED_EVENT, onChange);
      window.removeEventListener(CONTACT_CHANGED_EVENT, onMessagesChange);
      window.removeEventListener("focus", onChange);
      window.removeEventListener("focus", onMessagesChange);
    };
  }, [role, pathname]);

  const badgeCount = (href: string) =>
    href === "/admin/moderation" ? moderationCount : href === "/admin/messages" ? messagesCount : 0;

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
            {badgeCount(href) > 0 && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                  isActive(href)
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-amber-700 text-white"
                )}
              >
                {badgeCount(href) > 99 ? "99+" : badgeCount(href)}
              </span>
            )}
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
