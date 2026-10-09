import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import type { Status } from "@/types";
import { STATUS_LABELS } from "@/types/enums";
import { cn } from "@/lib/utils";

const badgeStyles: Record<Status, { icon: typeof CheckCircle2; className: string }> = {
  approved: { icon: CheckCircle2, className: "bg-emerald-100 text-emerald-700" },
  rejected: { icon: XCircle, className: "bg-red-100 text-red-700" },
  removed: { icon: AlertCircle, className: "bg-amber-100 text-amber-800" },
  pending: { icon: AlertCircle, className: "bg-amber-100 text-amber-700" },
  draft: { icon: AlertCircle, className: "bg-gray-100 text-gray-600" },
};

export function AdminStatusBadgeInline({ status }: { status: Status }) {
  const { icon: Icon, className } = badgeStyles[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold", className)}>
      <Icon className="h-3 w-3" aria-hidden />
      {STATUS_LABELS[status]}
    </span>
  );
}
