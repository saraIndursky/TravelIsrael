"use client";

import Link from "next/link";
import { Heart, PencilLine, Send } from "lucide-react";
import type { Trip } from "@/types";
import { canEditTrip } from "@/lib/data/trips";
import { tripEditPath } from "@/lib/utils/content-path";
import { useAuthStore } from "@/hooks/use-stores";

interface TripDetailActionsProps {
  trip: Trip;
  isFavorite?: boolean;
  onSave?: () => void;
  onDuplicate?: () => void;
  onSubmitForApproval?: () => void;
  saving?: boolean;
  duplicating?: boolean;
  submitting?: boolean;
}

export function TripDetailActions({
  trip,
  isFavorite,
  onSave,
  onDuplicate,
  onSubmitForApproval,
  saving,
  duplicating,
  submitting,
}: TripDetailActionsProps) {
  const { role, userId } = useAuthStore();
  const showEdit = canEditTrip(trip, role, userId || null);
  const isOwner = trip.created_by === userId;
  const showSubmit = isOwner && (trip.status === "draft" || trip.status === "rejected");

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 pt-4 md:px-6">
      <div className="rounded-[2px] border border-[#e5e7eb] bg-white p-4">
        <div className="flex flex-col gap-2">
          {showEdit || showSubmit ? (
            <>
              {showEdit && (
                <Link
                  href={tripEditPath(trip)}
                  className="flex w-full items-center justify-center gap-2 rounded-[2px] bg-[#111827] py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#1f2937]"
                >
                  <PencilLine className="h-4 w-4" />
                  {trip.status === "draft" ? "המשך עריכה" : "עריכת הטיול"}
                </Link>
              )}
              {showSubmit && (
                <button
                  type="button"
                  onClick={onSubmitForApproval}
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-[2px] border-2 border-[#111827] bg-white py-3.5 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f9fafb] disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {trip.status === "rejected" ? "שליחה מחדש לאישור" : "שליחה לאישור"}
                </button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-[2px] bg-[#111827] py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#1f2937] disabled:opacity-60"
              >
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                שמירה במועדפים
              </button>
              <button
                type="button"
                onClick={onDuplicate}
                disabled={duplicating}
                className="flex w-full items-center justify-center gap-2 rounded-[2px] border-2 border-[#111827] bg-white py-3.5 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f9fafb] disabled:opacity-60"
              >
                <PencilLine className="h-4 w-4" />
                שכפל ועדכן
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
