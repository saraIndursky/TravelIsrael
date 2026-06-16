"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, Trash2 } from "lucide-react";
import type { Place } from "@/types";
import { STATUS_LABELS } from "@/types/enums";
import { StatusBadge } from "@/components/ui/custom/badges";
import {
  tripCardActionDangerClass,
  tripCardActionPrimaryClass,
} from "@/components/features/trips/trip-card-shell";
import { formatTripCardDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MyPlaceCardProps {
  place: Place;
  onDelete?: () => Promise<void>;
  busy?: boolean;
}

export function MyPlaceCard({ place, onDelete, busy }: MyPlaceCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await onDelete?.();
    setConfirmDelete(false);
  }

  const canDelete = place.status === "pending" || place.status === "rejected";

  return (
    <div className="flex h-full flex-col overflow-hidden rounded border border-[#e5e7eb] bg-white">
      <div className="relative h-40 bg-[#f3f4f6]">
        <Image src={place.image_url} alt={place.name} fill className="object-cover" sizes="400px" />
      </div>
      <div className="flex flex-grow flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-medium text-[#111827]">{place.name}</h3>
          <StatusBadge status={place.status} />
        </div>
        <p className="text-sm text-[#6b7280]">
          {STATUS_LABELS[place.status]} · {place.region} · {place.place_type}
        </p>
        <p className="mt-2 line-clamp-2 text-sm text-[#6b7280]">{place.short_description}</p>
        <p className="mt-2 text-xs text-[#9ca3af]">
          {formatTripCardDuration(place.avg_duration_minutes)}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-[#e5e7eb] pt-3">
          <Link
            href={`/places/${place.id}`}
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

export const PLACE_TRAIL_STATUS_TABS = [
  { value: "pending" as const, label: "ממתינים לאישור" },
  { value: "approved" as const, label: "מאושרים" },
  { value: "rejected" as const, label: "נדחו" },
];
