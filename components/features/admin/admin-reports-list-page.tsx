"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ExternalLink, Filter, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EntityType, ReportWithEntityName } from "@/types";
import { ENTITY_TYPE_LABELS, REPORT_TYPE_LABELS, entityHref } from "@/components/features/admin/admin-report-labels";
import { CenteredPageLoading } from "@/components/layout/page-loading";

interface AdminReportsListPageProps {
  reports: ReportWithEntityName[];
  loading?: boolean;
  onResolve: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

type ReportTab = "pending" | "resolved" | "rejected";

const TABS: { label: string; value: ReportTab }[] = [
  { label: "ממתינים", value: "pending" },
  { label: "טופלו", value: "resolved" },
  { label: "נדחו", value: "rejected" },
];

const statusVariant = {
  pending: "warning" as const,
  resolved: "success" as const,
  rejected: "danger" as const,
};

const statusLabel = {
  pending: "ממתין",
  resolved: "טופל",
  rejected: "נדחה",
};

export function AdminReportsListPage({ reports, loading, onResolve, onReject }: AdminReportsListPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEntity, setFilterEntity] = useState<EntityType | "">("");
  const [activeTab, setActiveTab] = useState<ReportTab>("pending");

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const q = searchTerm.trim();
      const matchesTab = r.status === activeTab;
      const matchesSearch =
        !q ||
        r.reason.includes(q) ||
        r.entity_name.includes(q) ||
        r.entity_id.includes(q) ||
        (REPORT_TYPE_LABELS[r.report_type] ?? "").includes(q);
      const matchesEntity = !filterEntity || r.entity_type === filterEntity;
      return matchesTab && matchesSearch && matchesEntity;
    });
  }, [reports, activeTab, searchTerm, filterEntity]);

  if (loading) {
    return <CenteredPageLoading />;
  }

  return (
    <div className="min-h-full bg-secondary/30">
      <div className="border-b border-border/60 bg-white">
        <div className="px-4 py-6 md:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-light tracking-tight text-foreground md:text-3xl">דיווחים</h1>
            <p className="mt-1 text-sm text-muted-foreground">טיפול בדיווחי משתמשים על תוכן</p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            <StatBox value={reports.filter((r) => r.status === "pending").length} label="ממתינים לטיפול" variant="warning" />
            <StatBox value={reports.filter((r) => r.status === "resolved").length} label="טופלו" variant="success" />
            <StatBox value={reports.filter((r) => r.status === "rejected").length} label="נדחו" variant="danger" />
            <StatBox value={reports.length} label='סה"כ דיווחים' variant="info" />
          </div>
        </div>
      </div>

      <div className="border-b border-border/60 bg-white">
        <div className="flex gap-1 overflow-x-auto px-4 md:px-8">
          {TABS.map((tab) => {
            const count = reports.filter((r) => r.status === tab.value).length;
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

      <div className="border-b border-border/60 bg-white">
        <div className="px-4 py-4 md:px-8">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                type="search"
                placeholder="חפש לפי שם, סיבה או סוג..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ti-input pr-10"
              />
            </div>
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
          {(searchTerm || filterEntity) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">סינונים פעילים:</span>
              {searchTerm && <FilterChip label={`חיפוש: ${searchTerm}`} onClear={() => setSearchTerm("")} />}
              {filterEntity && (
                <FilterChip label={`תוכן: ${ENTITY_TYPE_LABELS[filterEntity]}`} onClear={() => setFilterEntity("")} />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-6 md:px-8">
        <p className="mb-4 text-sm text-muted-foreground">
          מציג {filtered.length} מתוך {reports.length} דיווחים
        </p>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 bg-white py-12 text-center">
            <Filter className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" aria-hidden />
            <p className="text-muted-foreground">לא נמצאו דיווחים</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((r) => (
              <div key={r.id} className="rounded-xl border border-border/60 bg-white p-5 transition hover:shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{ENTITY_TYPE_LABELS[r.entity_type]}</Badge>
                      <Badge variant={statusVariant[r.status]}>{statusLabel[r.status]}</Badge>
                      <Badge variant="outline">{REPORT_TYPE_LABELS[r.report_type] ?? r.report_type}</Badge>
                    </div>
                    <p className="text-lg font-semibold text-foreground">{r.entity_name}</p>
                    <p className="text-sm leading-relaxed text-foreground/90">{r.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString("he-IL", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link
                      href={entityHref(r.entity_type, r.entity_id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium transition hover:bg-muted"
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden />
                      צפה בתוכן
                    </Link>
                    {r.status === "pending" && (
                      <>
                        <Button size="sm" className="gap-1.5 rounded-xl" onClick={() => onResolve(r.id)}>
                          <Check className="h-3.5 w-3.5" aria-hidden />
                          טפל
                        </Button>
                        <Button size="sm" variant="danger" className="gap-1.5 rounded-xl" onClick={() => onReject(r.id)}>
                          <X className="h-3.5 w-3.5" aria-hidden />
                          דחה
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
    success: "text-emerald-600",
    warning: "text-amber-600",
    danger: "text-red-600",
    info: "text-blue-600",
  };

  return (
    <div className={`rounded-xl border p-4 ${styles[variant]}`}>
      <div className={`text-2xl font-bold tabular-nums ${valueStyles[variant]}`}>{value}</div>
      <div className="text-sm opacity-90">{label}</div>
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
