"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ExternalLink, Inbox, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CenteredPageLoading } from "@/components/layout/page-loading";
import { ENTITY_TYPE_LABELS, entityHref } from "@/components/features/admin/admin-report-labels";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import type { EntityType, ModerationKind, ModerationQueueItem } from "@/types";
import { toDisplayImageUrl } from "@/lib/utils/image-url";

interface AdminModerationListPageProps {
  items: ModerationQueueItem[];
  loading?: boolean;
  onSeen: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const KIND_LABELS: Record<ModerationKind, string> = {
  comment: "תגובה",
  gallery_image: "תמונה",
};

export function AdminModerationListPage({
  items,
  loading,
  onSeen,
  onDelete,
}: AdminModerationListPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEntity, setFilterEntity] = useState<EntityType | "">("");
  const [filterKind, setFilterKind] = useState<ModerationKind | "">("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ModerationQueueItem | null>(null);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const q = searchTerm.trim();
      const matchesSearch =
        !q ||
        item.entity_name.includes(q) ||
        item.content.includes(q) ||
        item.entity_id.includes(q);
      const matchesEntity = !filterEntity || item.entity_type === filterEntity;
      const matchesKind = !filterKind || item.kind === filterKind;
      return matchesSearch && matchesEntity && matchesKind;
    });
  }, [items, searchTerm, filterEntity, filterKind]);

  if (loading) {
    return <CenteredPageLoading />;
  }

  return (
    <div className="min-h-full bg-secondary/30">
      <div className="border-b border-border/60 bg-white">
        <div className="px-4 py-6 md:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-light tracking-tight text-foreground md:text-3xl">פיקוח תוכן</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              תגובות ותמונות מהקהילה עולות מיד. כאן אפשר לסמן שראית או למחוק לצמיתות.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            <StatBox value={items.length} label="ממתינים לצפייה" variant="warning" />
            <StatBox
              value={items.filter((item) => item.kind === "comment").length}
              label="תגובות"
              variant="info"
            />
            <StatBox
              value={items.filter((item) => item.kind === "gallery_image").length}
              label="תמונות"
              variant="info"
            />
          </div>
        </div>
      </div>

      <div className="border-b border-border/60 bg-white">
        <div className="px-4 py-4 md:px-8">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
            <input
              type="search"
              placeholder="חיפוש לפי שם תוכן או טקסט..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ti-input md:col-span-1"
            />
            <select
              aria-label="סוג פריט"
              value={filterKind}
              onChange={(e) => setFilterKind(e.target.value as ModerationKind | "")}
              className="ti-select w-full"
            >
              <option value="">כל הסוגים</option>
              <option value="comment">תגובות</option>
              <option value="gallery_image">תמונות</option>
            </select>
            <select
              aria-label="סוג תוכן"
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value as EntityType | "")}
              className="ti-select w-full"
            >
              <option value="">כל סוגי התוכן</option>
              <option value="trip">{ENTITY_TYPE_LABELS.trip}</option>
              <option value="place">{ENTITY_TYPE_LABELS.place}</option>
              <option value="trail">{ENTITY_TYPE_LABELS.trail}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 md:px-8">
        <p className="mb-4 text-sm text-muted-foreground">
          מציג {filtered.length} מתוך {items.length} פריטים
        </p>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 bg-white py-12 text-center">
            <Inbox className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" aria-hidden />
            <p className="text-muted-foreground">אין פריטים ממתינים לפיקוח</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => (
              <div key={item.id} className="rounded-xl border border-border/60 bg-white p-5 transition hover:shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{KIND_LABELS[item.kind]}</Badge>
                      <Badge variant="outline">{ENTITY_TYPE_LABELS[item.entity_type]}</Badge>
                    </div>
                    <p className="text-lg font-semibold text-foreground">{item.entity_name}</p>
                    {item.kind === "gallery_image" ? (
                      <div className="relative h-40 w-full max-w-xs overflow-hidden rounded-lg border border-border/60">
                        <Image
                          src={toDisplayImageUrl(item.content)}
                          alt="תמונה לפיקוח"
                          fill
                          className="object-cover"
                          sizes="320px"
                        />
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed text-foreground/90">{item.content}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString("he-IL", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link
                      href={entityHref(item.entity_type, item.entity_id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium transition hover:bg-muted"
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden />
                      צפייה בתוכן
                    </Link>
                    <Button
                      size="sm"
                      className="gap-1.5 rounded-xl"
                      disabled={busyId === item.id}
                      onClick={async () => {
                        setBusyId(item.id);
                        await onSeen(item.id);
                        setBusyId(null);
                      }}
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden />
                      ראיתי
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      className="gap-1.5 rounded-xl"
                      disabled={busyId === item.id}
                      onClick={() => setPendingDelete(item)}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      מחק
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDeleteDialog
        open={Boolean(pendingDelete)}
        description={
          pendingDelete?.kind === "gallery_image"
            ? "למחוק את התמונה לצמיתות? היא תוסר מהגלריה ולא ניתן לשחזר אותה."
            : "למחוק את התגובה לצמיתות? פעולה זו לא ניתנת לביטול."
        }
        confirming={Boolean(pendingDelete && busyId === pendingDelete.id)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          setBusyId(pendingDelete.id);
          await onDelete(pendingDelete.id);
          setBusyId(null);
          setPendingDelete(null);
        }}
        onClose={() => {
          if (pendingDelete && busyId === pendingDelete.id) return;
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

function StatBox({
  value,
  label,
  variant,
}: {
  value: number;
  label: string;
  variant: "warning" | "info";
}) {
  const styles = {
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  };
  const valueStyles = {
    warning: "text-amber-700",
    info: "text-blue-700",
  };

  return (
    <div className={`rounded-xl border p-4 ${styles[variant]}`}>
      <div className={`text-2xl font-bold tabular-nums ${valueStyles[variant]}`}>{value}</div>
      <div className="text-sm">{label}</div>
    </div>
  );
}
