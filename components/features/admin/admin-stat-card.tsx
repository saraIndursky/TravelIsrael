import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminStatCardProps {
  label: string;
  value: number;
  href: string;
  icon: LucideIcon;
  highlight?: boolean;
}

export function AdminStatCard({ label, value, href, icon: Icon, highlight }: AdminStatCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "ti-card group flex items-center gap-4 p-5 transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        highlight && value > 0 && "border-accent/40 bg-accent/5"
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition",
          highlight && value > 0 ? "bg-accent text-accent-foreground" : "bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-semibold tabular-nums text-foreground">{value}</p>
        <p className="truncate text-sm text-muted-foreground">{label}</p>
      </div>
    </Link>
  );
}
