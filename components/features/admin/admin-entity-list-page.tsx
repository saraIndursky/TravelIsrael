"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Filter, MapPin, Plus, Search, TrendingUp, User, X } from "lucide-react";
import {
  AdminDeleteModal,
  AdminRejectModal,
  AdminRejectReasonModal,
  AdminStatsModal,
  type AdminItemStats,
} from "@/components/features/admin/admin-list-modals";
import { getAdminActionsByStatus, getAdminMobileActions } from "@/components/features/admin/admin-list-actions";
import { AdminStatusBadgeInline } from "@/components/features/admin/admin-status-badge-inline";
import { POPULARITY_LABELS } from "@/lib/utils/admin-popularity";
import { adminListShowsE2eContent, isE2eTestContentName } from "@/lib/utils/e2e-content";
import type { Status, User as AppUser } from "@/types";
import { useRegionNames } from "@/hooks/use-region-names";
import { CenteredPageLoading } from "@/components/layout/page-loading";

type ListTab = "approved" | "pending" | "rejected" | "removed";

export interface AdminEntityListConfig<T extends { id: string; status: Status }> {
  title: string;
  subtitle: string;
  entityLabel: string;
  entityLabelPlural: string;
  addHref?: string;
  addLabel?: string;
  searchPlaceholder: string;
  typeFilter?: {
    label: string;
    allLabel: string;
    options: string[];
    getValue: (item: T) => string;
  };
  getImageUrl: (item: T) => string;
  getName: (item: T) => string;
  getTypeLabel: (item: T) => string;
  /** Optional highlight shown next to the type, e.g. a type nobody has used before. */
  getTypeBadges?: (item: T) => string[];
  getCreatorId: (item: T) => string;
  getRegion: (item: T) => string;
  getRejectionReason?: (item: T) => string | undefined;
  getRemovalReason?: (item: T) => string | undefined;
  getStats?: (item: T) => AdminItemStats;
  viewHref: (item: T) => string;
  editHref?: (item: T) => string;
  showPopularity?: boolean;
}

interface AdminEntityListPageProps<T extends { id: string; status: Status }> {
  config: AdminEntityListConfig<T>;
  items: T[];
  users: AppUser[];
  loading?: boolean;
  onApprove: (item: T) => Promise<void>;
  onReject: (item: T, reason: string) => Promise<void>;
  onUnpublish: (item: T, reason: string) => Promise<void>;
  onDelete: (item: T) => Promise<void>;
  onRestore: (item: T) => Promise<void>;
}

const TABS: { label: string; value: ListTab }[] = [
  { label: "מאושרים", value: "approved" },
  { label: "ממתינים לאישור", value: "pending" },
  { label: "נדחו", value: "rejected" },
  { label: "הוסרו", value: "removed" },
];

export function AdminEntityListPage<T extends { id: string; status: Status }>({
  config,
  items,
  users,
  loading,
  onApprove,
  onReject,
  onUnpublish,
  onDelete,
  onRestore,
}: AdminEntityListPageProps<T>) {
  const regionNames = useRegionNames();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [activeTab, setActiveTab] = useState<ListTab>("approved");
  const [deleteItem, setDeleteItem] = useState<T | null>(null);
  const [rejectItem, setRejectItem] = useState<T | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectReasonItem, setRejectReasonItem] = useState<T | null>(null);
  const [removalReasonItem, setRemovalReasonItem] = useState<T | null>(null);
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const [statsItem, setStatsItem] = useState<T | null>(null);

  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  const getCreator = (item: T) => {
    const user = userMap.get(config.getCreatorId(item));
    return { name: user?.name ?? "לא ידוע", email: user?.email ?? "" };
  };

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const user = userMap.get(config.getCreatorId(item));
      const creatorName = user?.name ?? "";
      const matchesStatus = item.status === activeTab;
      const q = searchTerm.trim();
      const matchesSearch =
        !q ||
        config.getName(item).includes(q) ||
        config.getRegion(item).includes(q) ||
        creatorName.includes(q);
      const matchesType = !filterType || !config.typeFilter || config.typeFilter.getValue(item) === filterType;
      const matchesRegion = !filterRegion || config.getRegion(item) === filterRegion;
      const matchesE2e =
        !isE2eTestContentName(config.getName(item)) || adminListShowsE2eContent(searchTerm);
      return matchesStatus && matchesSearch && matchesType && matchesRegion && matchesE2e;
    });
  }, [items, activeTab, searchTerm, filterType, filterRegion, config, userMap]);

  const showPopularity = config.showPopularity && activeTab === "approved";

  const handlers = {
    onView: (item: T) => router.push(config.viewHref(item)),
    onApprove: async (item: T) => {
      await onApprove(item);
    },
    onReject: (item: T) => {
      setRejectItem(item);
      setRejectReason("");
    },
    onUnpublish: (item: T) => {
      setRejectItem(item);
      setRejectReason("");
    },
    onEdit: config.editHref ? (item: T) => router.push(config.editHref!(item)) : undefined,
    onDelete: (item: T) => setDeleteItem(item),
    onRestore: async (item: T) => {
      await onRestore(item);
    },
    onStats: config.getStats ? (item: T) => setStatsItem(item) : undefined,
    onViewReject: (item: T) => setRejectReasonItem(item),
    onViewRemoval: (item: T) => setRemovalReasonItem(item),
  };

  if (loading) {
    return <CenteredPageLoading />;
  }

  return (
    <div className="min-h-full bg-secondary/30">
      {/* Header + Stats */}
      <div className="border-b border-border/60 bg-white">
        <div className="px-4 py-6 md:px-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-light tracking-tight text-foreground md:text-3xl">{config.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{config.subtitle}</p>
            </div>
            {config.addHref && (
              <Link href={config.addHref} className="ti-btn-primary shrink-0">
                <Plus className="h-5 w-5" aria-hidden />
                {config.addLabel ?? `הוסף ${config.entityLabel}`}
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            <StatBox value={items.filter((i) => i.status === "approved").length} label={`${config.entityLabelPlural} מאושרים`} variant="success" />
            <StatBox value={items.filter((i) => i.status === "pending").length} label="ממתינים לאישור" variant="warning" />
            <StatBox value={items.filter((i) => i.status === "rejected").length} label="נדחו" variant="danger" />
            <StatBox value={items.filter((i) => i.status === "removed").length} label="הוסרו" variant="danger" />
            <StatBox value={items.length} label={`סה״כ ${config.entityLabelPlural}`} variant="info" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border/60 bg-white">
        <div className="flex gap-1 overflow-x-auto px-4 md:px-8">
          {TABS.map((tab) => {
            const count = items.filter((i) => i.status === tab.value).length;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition ${
                  activeTab === tab.value
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border/60 bg-white">
        <div className="px-4 py-4 md:px-8">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4 md:gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                type="search"
                placeholder={config.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ti-input pr-10"
              />
            </div>
            {config.typeFilter && (
              <select aria-label={config.typeFilter.label} value={filterType} onChange={(e) => setFilterType(e.target.value)} className="ti-select w-full">
                <option value="">{config.typeFilter.allLabel}</option>
                {config.typeFilter.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}
            <select aria-label="אזור" value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)} className="ti-select w-full">
              <option value="">כל האזורים</option>
              {regionNames.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          {(searchTerm || filterType || filterRegion) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">סינונים פעילים:</span>
              {searchTerm && <FilterChip label={`חיפוש: ${searchTerm}`} onClear={() => setSearchTerm("")} />}
              {filterType && config.typeFilter && (
                <FilterChip label={`${config.typeFilter.label}: ${filterType}`} onClear={() => setFilterType("")} />
              )}
              {filterRegion && <FilterChip label={`אזור: ${filterRegion}`} onClear={() => setFilterRegion("")} />}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 md:px-8">
        <p className="mb-4 text-sm text-muted-foreground">
          מציג {filtered.length} מתוך {items.length} {config.entityLabelPlural}
        </p>

        <div className="overflow-hidden rounded-xl border border-border/60 bg-white">
          {/* Desktop */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border/60 bg-muted/30">
                <tr>
                  <th className="px-4 py-4 text-right text-sm font-medium text-muted-foreground">תמונה</th>
                  <th className="px-4 py-4 text-right text-sm font-medium text-muted-foreground">שם</th>
                  <th className="px-4 py-4 text-right text-sm font-medium text-muted-foreground">יוצר</th>
                  <th className="px-4 py-4 text-right text-sm font-medium text-muted-foreground">אזור</th>
                  <th className="px-4 py-4 text-right text-sm font-medium text-muted-foreground">סטטוס</th>
                  {showPopularity && (
                    <th className="px-4 py-4 text-right text-sm font-medium text-muted-foreground">פופולריות</th>
                  )}
                  <th className="px-4 py-4 text-right text-sm font-medium text-muted-foreground">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((item) => {
                  const creator = getCreator(item);
                  const stats = config.getStats?.(item);
                  return (
                    <tr key={item.id} className="transition hover:bg-muted/20">
                      <td className="px-4 py-4">
                        <div className="relative h-16 w-20 overflow-hidden rounded-lg">
                          <Image src={config.getImageUrl(item)} alt="" fill className="object-cover" sizes="80px" />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="max-w-[12rem] truncate font-medium">{config.getName(item)}</p>
                        <div className="mb-1 flex flex-wrap gap-1">
                          {config.getTypeBadges?.(item).map((badge) => (
                            <span
                              key={badge}
                              className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                              title={`${badge}: אישור הפריט יוסיף אותו לרשימה לכולם`}
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{config.getTypeLabel(item)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-2">
                          <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                          <div>
                            <p className="font-medium">{creator.name}</p>
                            <p className="text-xs text-muted-foreground">{creator.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                          {config.getRegion(item) || "לא צוין"}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <AdminStatusBadgeInline status={item.status} />
                      </td>
                      {showPopularity && stats && (
                        <td className="px-4 py-4">
                          <PopularityCell level={stats.popularity} />
                        </td>
                      )}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          {getAdminActionsByStatus(item, handlers).map((action, index) => {
                            const Icon = action.icon;
                            return (
                              <button
                                key={index}
                                type="button"
                                onClick={action.action}
                                className={`rounded-lg p-2 transition ${action.color}`}
                                title={action.label}
                                aria-label={action.label}
                              >
                                <Icon className="h-4 w-4" />
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="divide-y divide-border/60 lg:hidden">
            {filtered.map((item) => {
              const creator = getCreator(item);
              const mobileActions = getAdminMobileActions(item, handlers);
              return (
                <div key={item.id} className="p-4">
                  <div className="flex gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                      <Image src={config.getImageUrl(item)} alt="" fill className="object-cover" sizes="80px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{config.getName(item)}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <AdminStatusBadgeInline status={item.status} />
                        <span className="text-xs text-muted-foreground">{config.getTypeLabel(item)}</span>
                        {config.getTypeBadges?.(item).map((badge) => (
                          <span
                            key={badge}
                            className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">יוצר: </span>
                          <span className="font-medium">{creator.name}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">אזור: </span>
                          <span className="font-medium">{config.getRegion(item) || "לא צוין"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    {mobileActions.primary && (
                      <button
                        type="button"
                        onClick={mobileActions.primary.action}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${mobileActions.primary.className}`}
                      >
                        <mobileActions.primary.icon className="h-4 w-4" aria-hidden />
                        {mobileActions.primary.label}
                      </button>
                    )}
                    <div className="flex gap-2">
                      {mobileActions.secondary.map((action, index) => {
                        const Icon = action.icon;
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={action.action}
                            className={`rounded-lg p-2 ${action.className}`}
                          >
                            <Icon className="h-4 w-4" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <Filter className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" aria-hidden />
              <p className="text-muted-foreground">לא נמצאו תוצאות</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {deleteItem && (
        <AdminDeleteModal
          open
          name={config.getName(deleteItem)}
          entityLabel={config.entityLabel}
          onConfirm={async () => {
            await onDelete(deleteItem);
            setDeleteItem(null);
          }}
          onClose={() => setDeleteItem(null)}
        />
      )}

      {rejectItem && (
        <AdminRejectModal
          open
          name={config.getName(rejectItem)}
          entityLabel={config.entityLabel}
          reason={rejectReason}
          mode={rejectItem.status === "approved" ? "unpublish" : "review"}
          onReasonChange={setRejectReason}
          onConfirm={async () => {
            if (rejectSubmitting) return;
            setRejectSubmitting(true);
            try {
              if (rejectItem.status === "approved") {
                await onUnpublish(rejectItem, rejectReason);
              } else {
                await onReject(rejectItem, rejectReason);
              }
              setRejectItem(null);
              setRejectReason("");
            } finally {
              setRejectSubmitting(false);
            }
          }}
          submitting={rejectSubmitting}
          onClose={() => {
            if (rejectSubmitting) return;
            setRejectItem(null);
            setRejectReason("");
          }}
        />
      )}

      {removalReasonItem && (
        <AdminRejectReasonModal
          open
          variant="removal"
          name={config.getName(removalReasonItem)}
          creator={getCreator(removalReasonItem).name}
          region={config.getRegion(removalReasonItem)}
          typeLabel={config.getTypeLabel(removalReasonItem)}
          reason={config.getRemovalReason?.(removalReasonItem)}
          onClose={() => setRemovalReasonItem(null)}
        />
      )}

      {rejectReasonItem && (
        <AdminRejectReasonModal
          open
          name={config.getName(rejectReasonItem)}
          creator={getCreator(rejectReasonItem).name}
          region={config.getRegion(rejectReasonItem)}
          typeLabel={config.getTypeLabel(rejectReasonItem)}
          reason={config.getRejectionReason?.(rejectReasonItem)}
          onClose={() => setRejectReasonItem(null)}
        />
      )}

      {statsItem && config.getStats && (
        <AdminStatsModal
          open
          name={config.getName(statsItem)}
          region={config.getRegion(statsItem)}
          typeLabel={config.getTypeLabel(statsItem)}
          stats={config.getStats(statsItem)}
          onClose={() => setStatsItem(null)}
        />
      )}
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
  variant: "success" | "warning" | "danger" | "info";
}) {
  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    danger: "border-red-200 bg-red-50 text-red-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  };
  const valueStyles = {
    success: "text-emerald-700",
    warning: "text-amber-700",
    danger: "text-red-700",
    info: "text-blue-700",
  };

  return (
    <div className={`rounded-xl border p-4 ${styles[variant]}`}>
      <div className={`text-2xl font-bold tabular-nums ${valueStyles[variant]}`}>{value}</div>
      <div className="text-sm">{label}</div>
    </div>
  );
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm">
      <span>{label}</span>
      <button type="button" onClick={onClear} aria-label="הסר סינון">
        <X className="h-3 w-3 text-muted-foreground" />
      </button>
    </div>
  );
}

function PopularityCell({ level }: { level: "high" | "medium" | "low" }) {
  if (level === "high") {
    return (
      <div className="flex items-center gap-1 text-emerald-700">
        <TrendingUp className="h-4 w-4" aria-hidden />
        <span className="text-sm font-medium">{POPULARITY_LABELS.high}</span>
      </div>
    );
  }
  return <span className={`text-sm ${level === "medium" ? "text-muted-foreground" : "text-muted-foreground/70"}`}>{POPULARITY_LABELS[level]}</span>;
}
