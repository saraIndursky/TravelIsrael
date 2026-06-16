"use client";

import { Check, Pencil, Trash2, X } from "lucide-react";
import { StatusBadge } from "@/components/ui/custom/badges";
import { Button } from "@/components/ui/button";
import type { Status } from "@/types";

export interface AdminTableColumn<T> {
  key: string;
  label: string;
  render: (item: T) => React.ReactNode;
  hideOnMobile?: boolean;
}

interface AdminTableProps<T extends { id: string; status?: Status }> {
  items: T[];
  columns: AdminTableColumn<T>[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function AdminTable<T extends { id: string; status?: Status }>({
  items,
  columns,
  onApprove,
  onReject,
  onEdit,
  onDelete,
}: AdminTableProps<T>) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-muted/30 px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">אין פריטים להצגה</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/60">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/40">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground ${col.hideOnMobile ? "hidden sm:table-cell" : ""}`}
              >
                {col.label}
              </th>
            ))}
            <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              פעולות
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-border/40 last:border-0 transition hover:bg-muted/30">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3.5 align-middle ${col.hideOnMobile ? "hidden sm:table-cell" : ""}`}
                >
                  {col.key === "status" && item.status ? (
                    <StatusBadge status={item.status} />
                  ) : (
                    col.render(item)
                  )}
                </td>
              ))}
              <td className="px-4 py-3.5 align-middle">
                <div className="flex flex-wrap items-center gap-1.5">
                  {item.status && colHasStatus(columns) === false && <StatusBadge status={item.status} />}
                  {onApprove && item.status === "pending" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 gap-1 rounded-lg px-2.5"
                      onClick={() => onApprove(item.id)}
                      aria-label="אשר"
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden />
                      <span className="hidden sm:inline">אשר</span>
                    </Button>
                  )}
                  {onReject && item.status === "pending" && (
                    <Button
                      size="sm"
                      variant="danger"
                      className="h-8 gap-1 rounded-lg px-2.5"
                      onClick={() => onReject(item.id)}
                      aria-label="דחה"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden />
                      <span className="hidden sm:inline">דחה</span>
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 gap-1 rounded-lg px-2.5"
                      onClick={() => onEdit(item.id)}
                      aria-label="ערוך"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                      <span className="hidden sm:inline">ערוך</span>
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 gap-1 rounded-lg px-2.5 text-destructive hover:text-destructive"
                      onClick={() => onDelete(item.id)}
                      aria-label="מחק"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      <span className="hidden sm:inline">מחק</span>
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function colHasStatus<T>(columns: AdminTableColumn<T>[]) {
  return columns.some((c) => c.key === "status");
}
