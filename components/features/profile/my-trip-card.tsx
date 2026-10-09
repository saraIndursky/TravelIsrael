"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  MapPin,
  PencilLine,
  Send,
  Trash2,
} from "lucide-react";
import type { Status, Trip } from "@/types";
import { DIFFICULTY_LABELS, STATUS_LABELS } from "@/types/enums";
import { canEditTrip } from "@/lib/data/trips";
import { useAuthStore } from "@/hooks/use-stores";
import { StatusBadge } from "@/components/ui/custom/badges";
import { RatingStars } from "@/components/ui/custom/rating-stars";
import {
  TripCardShell,
  tripCardActionClass,
  tripCardActionDangerClass,
  tripCardActionPrimaryClass,
} from "@/components/features/trips/trip-card-shell";
import { formatTripCardDuration, getReviewCount } from "@/lib/utils";
import { getDifficultyColor } from "@/lib/utils/trip-display";
import { tripEditPath, tripPath } from "@/lib/utils/content-path";
import { cn } from "@/lib/utils";

interface MyTripCardProps {
  trip: Trip;
  onSubmit?: () => Promise<void>;
  onDelete?: () => Promise<void>;
  onDuplicate?: () => Promise<void>;
  busy?: boolean;
}

function getStatusSubtitle(trip: Trip): string {
  return `${STATUS_LABELS[trip.status]} · ${trip.region}`;
}

function ActionLink({
  href,
  children,
  variant = "default",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "default" | "primary";
}) {
  return (
    <Link
      href={href}
      className={variant === "primary" ? tripCardActionPrimaryClass : tripCardActionClass}
    >
      {children}
    </Link>
  );
}

function ActionButton({
  children,
  onClick,
  variant = "default",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary" | "danger";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        variant === "primary" && tripCardActionPrimaryClass,
        variant === "danger" && tripCardActionDangerClass,
        variant === "default" && tripCardActionClass
      )}
    >
      {children}
    </button>
  );
}

export function MyTripCard({ trip, onSubmit, onDelete, onDuplicate, busy }: MyTripCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { role, userId } = useAuthStore();
  const showEdit = canEditTrip(trip, role, userId || null);

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await onDelete?.();
    setConfirmDelete(false);
  }

  const createdDate = new Date(trip.created_at).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const reviewCount = getReviewCount(trip);

  const actions = (() => {
    switch (trip.status) {
      case "draft":
        return (
          <>
            {showEdit && (
              <ActionLink href={tripEditPath(trip)} variant="primary">
                <PencilLine className="h-4 w-4" />
                המשך עריכה
              </ActionLink>
            )}
            <ActionButton onClick={onSubmit} disabled={busy}>
              <Send className="h-4 w-4" />
              שליחה לאישור
            </ActionButton>
            <ActionButton onClick={handleDelete} variant="danger" disabled={busy}>
              <Trash2 className="h-4 w-4" />
              {confirmDelete ? "אישור מחיקה" : "מחיקה"}
            </ActionButton>
          </>
        );
      case "pending":
        return (
          <>
            <ActionLink href={tripPath(trip)} variant="primary">
              <Eye className="h-4 w-4" />
              צפייה
            </ActionLink>
            {showEdit && (
              <ActionLink href={tripEditPath(trip)}>
                <PencilLine className="h-4 w-4" />
                עריכה
              </ActionLink>
            )}
            <ActionButton onClick={handleDelete} variant="danger" disabled={busy}>
              <Trash2 className="h-4 w-4" />
              {confirmDelete ? "אישור מחיקה" : "מחיקה"}
            </ActionButton>
          </>
        );
      case "approved":
        return (
          <>
            <ActionLink href={tripPath(trip)} variant="primary">
              <Eye className="h-4 w-4" />
              צפייה בטיול
            </ActionLink>
            {showEdit && (
              <ActionLink href={tripEditPath(trip)}>
                <PencilLine className="h-4 w-4" />
                עריכה
              </ActionLink>
            )}
            <ActionButton onClick={onDuplicate} disabled={busy}>
              <Copy className="h-4 w-4" />
              שכפל וערוך
            </ActionButton>
          </>
        );
      case "rejected":
        return (
          <>
            <ActionLink href={tripPath(trip)} variant="primary">
              <Eye className="h-4 w-4" />
              צפייה
            </ActionLink>
            {showEdit && (
              <ActionLink href={tripEditPath(trip)}>
                <PencilLine className="h-4 w-4" />
                עריכה
              </ActionLink>
            )}
            <ActionButton onClick={onSubmit} disabled={busy}>
              <Send className="h-4 w-4" />
              שליחה מחדש
            </ActionButton>
            <ActionButton onClick={handleDelete} variant="danger" disabled={busy}>
              <Trash2 className="h-4 w-4" />
              {confirmDelete ? "אישור מחיקה" : "מחיקה"}
            </ActionButton>
          </>
        );
      case "removed":
        return (
          <>
            <ActionLink href={tripPath(trip)} variant="primary">
              <Eye className="h-4 w-4" />
              צפייה
            </ActionLink>
            <ActionButton onClick={onSubmit} disabled={busy}>
              <Send className="h-4 w-4" />
              שליחה שוב לאישור
            </ActionButton>
          </>
        );
    }
  })();

  return (
    <TripCardShell
      trip={trip}
      headerExtra={<StatusBadge status={trip.status} />}
      subtitle={<p className="text-sm text-[#6b7280]">{getStatusSubtitle(trip)}</p>}
      footer={actions}
    >
      {trip.status === "approved" && (
        <div className="mb-3 flex items-center gap-2">
          {reviewCount === 0 ? (
            <span className="text-sm text-gray-500">חדש</span>
          ) : (
            <RatingStars rating={trip.avg_rating} />
          )}
          <span className="text-sm text-gray-500">({reviewCount} ביקורות)</span>
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
        <span
          className={`rounded px-2 py-1 font-medium ${getDifficultyColor(DIFFICULTY_LABELS[trip.difficulty])}`}
        >
          {DIFFICULTY_LABELS[trip.difficulty]}
        </span>
        <span className="flex items-center gap-1 text-[#6b7280]">
          <Clock className="h-3.5 w-3.5" />
          {formatTripCardDuration(trip.total_duration_minutes)}
        </span>
        <span className="flex items-center gap-1 text-[#6b7280]">
          <MapPin className="h-3.5 w-3.5" />
          {trip.station_count} תחנות
        </span>
        <span className="text-[#6b7280]">{createdDate}</span>
      </div>

      <p className="mb-3 line-clamp-2 text-sm text-[#6b7280]">
        {trip.short_description?.trim() || "אין תיאור"}
      </p>

      {trip.status === "draft" && (
        <p className="mb-1 flex items-center justify-end gap-1.5 text-xs text-gray-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          הטיול פרטי — לא מוצג למשתמשים אחרים.
        </p>
      )}

      {trip.status === "pending" && (
        <p className="mb-1 flex items-center justify-end gap-1.5 text-xs text-amber-700">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          הטיול ממתין לבדיקת מנהל.
        </p>
      )}

      {trip.status === "approved" && (
        <p className="mb-1 flex items-center justify-end gap-1.5 text-xs text-green-700">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          טיול מאושר וגלוי לכלל המשתמשים
        </p>
      )}

      {trip.status === "rejected" && trip.rejection_reason && (
        <div className="rounded border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
          {trip.rejection_reason}
        </div>
      )}

      {trip.status === "removed" && (
        <div className="rounded border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {trip.removal_reason?.trim() || "הטיול הוסר מהאתר על ידי מנהל."}
        </div>
      )}
    </TripCardShell>
  );
}

export const CREATED_STATUS_TABS: { value: Status; label: string }[] = [
  { value: "draft", label: "טיוטות" },
  { value: "pending", label: "ממתינים לאישור" },
  { value: "approved", label: "מאושרים" },
  { value: "rejected", label: "נדחו" },
  { value: "removed", label: "הוסרו מהאתר" },
];
