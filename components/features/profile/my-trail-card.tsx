"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, Trash2 } from "lucide-react";
import type { Trail } from "@/types";
import { DIFFICULTY_LABELS, STATUS_LABELS } from "@/types/enums";
import { StatusBadge } from "@/components/ui/custom/badges";
import {
  tripCardActionClass,
  tripCardActionDangerClass,
  tripCardActionPrimaryClass,
} from "@/components/features/trips/trip-card-shell";
import { cn } from "@/lib/utils";

interface MyTrailCardProps {
  trail: Trail;
  onDelete?: () => Promise<void>;
  busy?: boolean;
}

export function MyTrailCard({ trail, onDelete, busy }: MyTrailCardProps) {
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
        <div className="mt-4 flex flex-wrap gap-2 border-t border-[#e5e7eb] pt-3">
          <Link
            href={`/trails/${trail.id}`}
            className={cn(tripCardActionPrimaryClass, "inline-flex items-center gap-1")}
          >
            <Eye className="h-4 w-4" />
            צפייה
          </Link>
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
        </div>
      </div>
    </div>
  );
}
