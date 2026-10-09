import { User } from "lucide-react";
import { cn } from "@/lib/utils";

function getFirstNameInitial(name: string): string {
  const firstName = name.trim().split(/\s+/)[0] ?? "";
  return firstName.charAt(0) || "?";
}

const sizeStyles = {
  sm: {
    container: "h-8 w-8",
    badge: "h-3.5 min-w-[14px] text-[9px]",
    initial: "text-sm",
    icon: "h-4 w-4",
  },
  md: {
    container: "h-10 w-10",
    badge: "h-4 min-w-4 text-[10px]",
    initial: "text-base",
    icon: "h-5 w-5",
  },
  lg: {
    container: "h-12 w-12",
    badge: "h-5 min-w-5 text-[11px]",
    initial: "text-lg",
    icon: "h-6 w-6",
  },
  xl: {
    container: "h-20 w-20",
    badge: "h-7 min-w-7 text-sm",
    initial: "text-2xl",
    icon: "h-10 w-10",
  },
} as const;

export type UserAvatarSize = keyof typeof sizeStyles;

interface UserAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: UserAvatarSize;
  className?: string;
  /** light = על רקע כהה (הידר עמוד הבית) */
  variant?: "default" | "light";
}

export function UserAvatar({
  name,
  avatarUrl,
  size = "md",
  className,
  variant = "default",
}: UserAvatarProps) {
  const initial = getFirstNameInitial(name);
  const styles = sizeStyles[size];

  const photoRing =
    variant === "light"
      ? "ring-2 ring-white/90 shadow-lg shadow-black/30"
      : "ring-1 ring-gray-200 shadow-sm";

  const badgeClass = cn(
    "absolute -bottom-0.5 -left-0.5 grid place-items-center rounded-full",
    "bg-white font-bold leading-none text-gray-900",
    "ring-1 ring-white shadow-[0_1px_3px_rgba(0,0,0,0.22)]",
    styles.badge
  );

  if (avatarUrl) {
    return (
      <div className={cn("relative shrink-0", styles.container, className)}>
        <div className={cn("h-full w-full overflow-hidden rounded-full", photoRing)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        </div>
        {initial !== "?" && (
          <span className={badgeClass} aria-hidden>
            <span className="block translate-y-px leading-none">{initial}</span>
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid shrink-0 select-none place-items-center rounded-full",
        "bg-gradient-to-br from-slate-500 via-slate-700 to-slate-900 font-semibold text-white",
        variant === "light" ? "ring-1 ring-white/90 shadow-lg shadow-black/30" : "ring-1 ring-gray-200 shadow-sm",
        styles.container,
        styles.initial,
        className
      )}
    >
      {initial !== "?" ? (
        <span className="block translate-y-px leading-none">{initial}</span>
      ) : (
        <User className={cn(styles.icon, "text-white/90")} />
      )}
    </div>
  );
}
