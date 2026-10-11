"use client";

import { AlertCircle, Bookmark, Eye, MapPin, MessageSquare, Star, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { POPULARITY_LABELS, type PopularityLevel } from "@/lib/utils/admin-popularity";

interface DeleteModalProps {
  open: boolean;
  name: string;
  entityLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function AdminDeleteModal({ open, name, entityLabel, onConfirm, onClose }: DeleteModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" aria-hidden />
          </div>
          <div className="space-y-2">
            <DialogHeader>
              <DialogTitle>אישור מחיקה</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              האם אתה בטוח שברצונך למחוק את {entityLabel} &quot;{name}&quot;?
              <br />
              פעולה זו לא ניתנת לביטול.
            </p>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="danger" className="flex-1 rounded-xl" onClick={onConfirm}>
            מחק
          </Button>
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>
            ביטול
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface RejectModalProps {
  open: boolean;
  name: string;
  entityLabel: string;
  reason: string;
  submitting?: boolean;
  /** When unpublishing approved content — different copy */
  mode?: "review" | "unpublish";
  onReasonChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export function AdminRejectModal({
  open,
  name,
  entityLabel,
  reason,
  submitting = false,
  mode = "review",
  onReasonChange,
  onConfirm,
  onClose,
}: RejectModalProps) {
  const isUnpublish = mode === "unpublish";
  return (
    <Dialog open={open} onOpenChange={(v) => !v && !submitting && onClose()}>
      <DialogContent className="max-w-md">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
            <MessageSquare className="h-6 w-6 text-red-600" aria-hidden />
          </div>
          <div className="flex-1 space-y-3">
            <DialogHeader>
              <DialogTitle>{isUnpublish ? `הסרת ${entityLabel} מהאתר` : `דחיית ${entityLabel}`}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              {isUnpublish ? (
                <>
                  {entityLabel} &quot;{name}&quot; יסומן כ״הוסר מהאתר״ — לא כנדחה. התוכן נשמר במערכת.
                  <br />
                  היוצר יוכל לשלוח שוב לאישור. משתמשים ששמרו במועדפים יראו אותו כל עוד השמירה פעילה.
                </>
              ) : (
                <>
                  {entityLabel} &quot;{name}&quot; יסומן כנדחה. ניתן לציין סיבה לבעלים.
                </>
              )}
            </p>
            <label className="block text-sm font-medium text-muted-foreground">
              {isUnpublish ? "סיבה להסרה (אופציונלי)" : "סיבת הדחייה (אופציונלי)"}
              <textarea
                value={reason}
                onChange={(e) => onReasonChange(e.target.value)}
                placeholder={isUnpublish ? "הסבר למה הוסר מהאתר..." : "הסבר למשתמש מדוע נדחה..."}
                rows={4}
                className="mt-2 w-full resize-none rounded-xl border border-border px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="danger" className="flex-1 rounded-xl" onClick={onConfirm} disabled={submitting}>
            {submitting ? "שולח..." : isUnpublish ? "הסר מהאתר" : "דחה"}
          </Button>
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose} disabled={submitting}>
            ביטול
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface RejectReasonModalProps {
  open: boolean;
  name: string;
  creator: string;
  region: string;
  typeLabel: string;
  reason?: string;
  variant?: "rejection" | "removal";
  onClose: () => void;
}

export function AdminRejectReasonModal({
  open,
  name,
  creator,
  region,
  typeLabel,
  reason,
  variant = "rejection",
  onClose,
}: RejectReasonModalProps) {
  const isRemoval = variant === "removal";
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isRemoval ? `סיבת ההסרה — ${name}` : `סיבת הדחייה — ${name}`}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="space-y-1 text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">יוצר:</span> {creator}
            </p>
            <p>
              <span className="font-medium text-foreground">אזור:</span> {region || "לא צוין"}
            </p>
            <p>
              <span className="font-medium text-foreground">סוג:</span> {typeLabel}
            </p>
          </div>
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <p className="mb-2 text-sm font-semibold text-red-600">
              {isRemoval ? "סיבת ההסרה מהאתר" : "סיבת הדחייה"}
            </p>
            <p className="text-foreground/90">{reason || "לא צוינה סיבה"}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export interface AdminItemStats {
  rating: number;
  saves: number;
  views: number;
  popularity: PopularityLevel;
}

interface StatsModalProps {
  open: boolean;
  name: string;
  region: string;
  typeLabel: string;
  stats: AdminItemStats;
  onClose: () => void;
}

export function AdminStatsModal({ open, name, region, typeLabel, stats, onClose }: StatsModalProps) {
  const popularityWidth =
    stats.popularity === "high" ? "w-full" : stats.popularity === "medium" ? "w-2/3" : "w-1/3";
  const popularityColor =
    stats.popularity === "high" ? "bg-emerald-500" : stats.popularity === "medium" ? "bg-amber-500" : "bg-red-500";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>סטטיסטיקות</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold">{name}</h4>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" aria-hidden />
              <span>{region || "לא צוין"}</span>
              <span>•</span>
              <span>{typeLabel}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-amber-900">
                <Star className="h-5 w-5 text-amber-600" aria-hidden />
                דירוג
              </div>
              <div className="text-3xl font-bold text-amber-600">{stats.rating > 0 ? stats.rating.toFixed(1) : "—"}</div>
              <div className="mt-1 text-xs text-amber-800">ממוצע ביקורות</div>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-blue-900">
                <Bookmark className="h-5 w-5 text-blue-600" aria-hidden />
                שמירות
              </div>
              <div className="text-3xl font-bold text-blue-600">{stats.saves}</div>
              <div className="mt-1 text-xs text-blue-800">משתמשים שמרו</div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-emerald-900">
                <Eye className="h-5 w-5 text-emerald-700" aria-hidden />
                צפיות
              </div>
              <div className="text-3xl font-bold text-emerald-700">{stats.views}</div>
              <div className="mt-1 text-xs text-emerald-800">סה״כ צפיות</div>
            </div>
          </div>

          <div className="rounded-xl bg-muted/50 p-4">
            <h5 className="mb-3 font-semibold">פופולריות</h5>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">רמת פופולריות</span>
              <span className="flex items-center gap-1 font-semibold">
                {stats.popularity === "high" && <TrendingUp className="h-4 w-4 text-emerald-700" aria-hidden />}
                {POPULARITY_LABELS[stats.popularity]}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
              <div className={`h-full rounded-full ${popularityColor} ${popularityWidth}`} />
            </div>
          </div>
        </div>

        <Button variant="outline" className="w-full rounded-xl" onClick={onClose}>
          <X className="h-4 w-4" aria-hidden />
          סגור
        </Button>
      </DialogContent>
    </Dialog>
  );
}

interface TripPendingItem {
  id: string;
  name: string;
  href: string;
  typeLabel: string;
}

interface TripApproveModalProps {
  open: boolean;
  tripName: string;
  places: TripPendingItem[];
  trails: TripPendingItem[];
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function AdminTripApproveModal({
  open,
  tripName,
  places,
  trails,
  loading,
  onConfirm,
  onClose,
}: TripApproveModalProps) {
  const totalPending = places.length + trails.length;

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>אישור טיול — תוכן ממתין</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            הטיול &quot;{tripName}&quot; כולל {totalPending} פריטים שממתינים לאישור. לאחר אישור הטיול, גם הם
            יאושרו אוטומטית.
          </p>

          {places.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="mb-2 font-semibold text-amber-900">מקומות ממתינים ({places.length})</p>
              <ul className="space-y-2">
                {places.map((place) => (
                  <li key={place.id} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{place.name}</p>
                      <p className="text-xs text-muted-foreground">{place.typeLabel}</p>
                    </div>
                    <a
                      href={place.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-xs font-medium text-primary hover:underline"
                    >
                      צפייה
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {trails.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="mb-2 font-semibold text-amber-900">מסלולים ממתינים ({trails.length})</p>
              <ul className="space-y-2">
                {trails.map((trail) => (
                  <li key={trail.id} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{trail.name}</p>
                      <p className="text-xs text-muted-foreground">{trail.typeLabel}</p>
                    </div>
                    <a
                      href={trail.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-xs font-medium text-primary hover:underline"
                    >
                      צפייה
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button className="flex-1 rounded-xl" onClick={onConfirm} disabled={loading}>
            {loading ? "מאשר..." : "אשר טיול ותוכן"}
          </Button>
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose} disabled={loading}>
            ביטול
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
