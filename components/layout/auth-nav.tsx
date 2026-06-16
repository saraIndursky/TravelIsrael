"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, LogOut, User } from "lucide-react";
import { getStore } from "@/lib/data/store";
import { useAuthStore } from "@/hooks/use-stores";
import { cn } from "@/lib/utils";

interface LoginButtonProps {
  className?: string;
  onNavigate?: () => void;
}

export function LoginButton({ className, onNavigate }: LoginButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        onNavigate?.();
        router.push("/login");
      }}
      className={cn(
        "group inline-flex items-center gap-3 rounded border border-gray-300 bg-white/90 px-6 py-3 text-sm font-medium text-gray-900 transition-all hover:scale-105 hover:bg-gray-50 hover:shadow-lg",
        className
      )}
    >
      התחבר
    </button>
  );
}

function UserAvatar({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  const initial = name.trim().charAt(0) || "?";
  const sizeClass = size === "lg" ? "h-12 w-12 text-lg" : "h-10 w-10 text-base";

  return (
    <div
      className={cn(
        "flex select-none items-center justify-center rounded-full bg-gray-900 font-semibold text-white",
        sizeClass
      )}
    >
      {initial !== "?" ? initial : <User className="h-5 w-5 text-white" />}
    </div>
  );
}

export function UserMenu() {
  const router = useRouter();
  const { userId, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const user = getStore().users.find((u) => u.id === userId);
  const displayName = user?.name ?? "משתמש";
  const nameParts = displayName.trim().split(/\s+/);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");

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

  function handleLogout() {
    logout();
    setOpen(false);
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
        <UserAvatar name={displayName} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="mt-2 flex flex-col items-center px-2 py-3">
            <UserAvatar name={displayName} size="lg" />
            <span className="mt-2 text-sm font-medium text-gray-900">
              {firstName} {lastName}
            </span>
          </div>

          <div className="my-2 border-t border-gray-200" />

          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="flex w-full items-center justify-between px-4 py-2 text-right text-sm hover:bg-gray-100"
          >
            האזור האישי
            <User className="h-5 w-5 text-gray-500" />
          </button>

          <button
            type="button"
            onClick={() => navigate("/profile/content")}
            className="flex w-full items-center justify-between px-4 py-2 text-right text-sm hover:bg-gray-100"
          >
            הטיולים שלי
            <Heart className="h-5 w-5 text-gray-500" />
          </button>

          <div className="my-1 border-t" />

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-between px-4 py-2 text-right text-sm text-red-600 hover:bg-red-50"
          >
            התנתקות
            <LogOut className="h-4 w-4 text-red-600" />
          </button>
        </div>
      )}
    </div>
  );
}

interface AuthNavProps {
  className?: string;
  onNavigate?: () => void;
}

export function AuthNav({ className, onNavigate }: AuthNavProps) {
  const { role } = useAuthStore();

  if (role === "guest") {
    return <LoginButton className={className} onNavigate={onNavigate} />;
  }

  return <UserMenu />;
}
