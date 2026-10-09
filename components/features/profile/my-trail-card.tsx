"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, Pencil, Send, Trash2 } from "lucide-react";
import type { Trail } from "@/types";
import { DIFFICULTY_LABELS, STATUS_LABELS } from "@/types/enums";
import { StatusBadge } from "@/components/ui/custom/badges";
import {
  tripCardActionClass,
  tripCardActionDangerClass,
  tripCardActionPrimaryClass,
} from "@/components/features/trips/trip-card-shell";
import { trailEditPath, trailPath } from "@/lib/utils/content-path";
import { cn } from "@/lib/utils";

interface MyTrailCardProps {
  trail: Trail;
  onDelete?: () => Promise<void>;
  onResubmit?: () => Promise<void>;
  busy?: boolean;
}

export function MyTrailCard({ trail, onDelete, onResubmit, busy }: MyTrailCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await onDelete?.();
    setConfirmDelete(false);
  }

  const canDelete = trail.status === "pending" || trail.status === "rejected";
  const canEdit = canDelete;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded border border-[#e5e7eb] bg-white">
      <div className="relative h-40 bg-[#f3f4f6]">
        <Image src={trail.image_url} alt={trail.name} fill className="object-cover" sizes="400px" />
      </div>
      <div className="flex flex-grow flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-medium text-[#111827]">{trail.name}</h3>
          <StatusBadge status={trail.status} />
        </div>
        <p className="text-sm text-[#6b7280]">
          {STATUS_LABELS[trail.status]} · {trail.region} · {DIFFICULTY_LABELS[trail.difficulty]}
        </p>
        <p className="mt-2 line-clamp-2 text-sm text-[#6b7280]">{trail.short_description}</p>
        <p className="mt-2 text-xs text-[#9ca3af]">{trail.length_km} ק״מ</p>
        {trail.status === "rejected" && trail.rejection_reason && (
          <div className="mt-2 rounded border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
            {trail.rejection_reason}
          </div>
        )}
        {trail.status === "removed" && (
          <div className="mt-2 rounded border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            {trail.removal_reason?.trim() || "המסלול הוסר מהאתר על ידי מנהל."}
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-[#e5e7eb] pt-3">
          <Link
            href={trailPath(trail)}
            className={cn(tripCardActionPrimaryClass, "inline-flex items-center gap-1")}
          >
            <Eye className="h-4 w-4" />
            צפייה
          </Link>
          {canEdit && (
            <Link
              href={trailEditPath(trail)}
              className={cn(tripCardActionClass, "inline-flex items-center gap-1")}
            >
              <Pencil className="h-4 w-4" />
              עריכה
            </Link>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={busy}
              className={cn(tripCardActionDangerClass, "inline-flex items-center gap-1")}
            >
              <Trash2 className="h-4 w-4" />
              {confirmDelete ? "אישור מחיקה" : "מחיקה"}
            </button>
          )}
          {trail.status === "removed" && onResubmit && (
            <button
              type="button"
              onClick={() => void onResubmit()}
              disabled={busy}
              className={cn(tripCardActionClass, "inline-flex items-center gap-1")}
            >
              <Send className="h-4 w-4" />
              שליחה שוב לאישור
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
