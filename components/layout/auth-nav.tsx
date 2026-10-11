"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Heart, LogOut, User } from "lucide-react";
import { UserAvatar } from "@/components/ui/custom/user-avatar";
import { useAuthStore } from "@/hooks/use-stores";
import { signOutUser } from "@/lib/data/auth";
import { cn } from "@/lib/utils";

interface LoginButtonProps {
  className?: string;
  onNavigate?: () => void;
  compact?: boolean;
}

export function LoginButton({ className, onNavigate, compact = false }: LoginButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        onNavigate?.();
        router.push("/login");
      }}
      className={cn(
        "group inline-flex items-center gap-2 rounded border border-gray-300 bg-white/90 text-sm font-medium text-gray-900 transition-all hover:bg-gray-50 hover:shadow-md",
        compact ? "px-3 py-2" : "gap-3 px-6 py-3 hover:scale-105 hover:shadow-lg",
        className
      )}
    >
      כניסה
    </button>
  );
}

export function UserMenu() {
  const router = useRouter();
  const { userName, userEmail, avatarUrl, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = userName || "משתמש";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function navigate(path: string) {
    router.push(path);
    setOpen(false);
  }

  async function handleLogout() {
    await signOutUser();
    logout();
    setOpen(false);
    router.push("/");
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label="תפריט משתמש"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <UserAvatar name={displayName} avatarUrl={avatarUrl} />
      </button>

      {open && (
        <div className="absolute end-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-4">
            <UserAvatar name={displayName} avatarUrl={avatarUrl} size="md" className="shrink-0" />
            <div className="min-w-0 flex-1 text-right">
              <p className="truncate text-base font-semibold leading-relaxed text-gray-900">{displayName}</p>
              {userEmail ? (
                <p className="mt-2.5 break-all text-sm leading-relaxed text-gray-500" dir="ltr">
                  {userEmail}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-0.5 py-3">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="flex w-full items-center justify-between px-4 py-3 text-right text-[17px] text-gray-900 transition-colors hover:bg-gray-50 hover:text-gray-950 focus-visible:outline-none"
            >
              <span>האזור האישי</span>
              <User className="h-[18px] w-[18px] shrink-0 text-gray-500" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/profile/content")}
              className="flex w-full items-center justify-between px-4 py-3 text-right text-[17px] text-gray-900 transition-colors hover:bg-gray-50 hover:text-gray-950 focus-visible:outline-none"
            >
              <span>הטיולים שלי</span>
              <Heart className="h-[18px] w-[18px] shrink-0 text-gray-500" />
            </button>
          </div>

          <div className="border-t border-gray-200 py-3">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-between px-4 py-3 text-right text-[17px] text-red-600 transition-colors hover:bg-red-50/70 hover:text-red-700 focus-visible:outline-none"
            >
              <span>התנתקות</span>
              <LogOut className="h-[18px] w-[18px] shrink-0 text-red-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface AuthNavProps {
  className?: string;
  onNavigate?: () => void;
  compact?: boolean;
}

export function AuthNav({ className, onNavigate, compact = false }: AuthNavProps) {
  const { role } = useAuthStore();

  if (role === "guest") {
    return <LoginButton className={className} onNavigate={onNavigate} compact={compact} />;
  }

  return (
    <div className={cn("shrink-0", className)}>
      <UserMenu />
    </div>
  );
}
