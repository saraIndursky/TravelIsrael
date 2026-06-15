"use client";

import { StatusBadge } from "@/components/ui/custom/badges";
import { Button } from "@/components/ui/button";
import type { Status } from "@/types";

export interface AdminTableColumn<T> {
  key: string;
  label: string;
  render: (item: T) => React.ReactNode;
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
    return <p className="text-center text-muted-foreground py-8">אין פריטים להצגה</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border/60">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-right font-medium">{col.label}</th>
            ))}
            <th className="px-4 py-3 text-right font-medium">פעולות</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t hover:bg-muted/50">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3">{col.render(item)}</td>
              ))}
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {item.status && <StatusBadge status={item.status} />}
                  {onApprove && item.status === "pending" && (
                    <Button size="sm" variant="secondary" onClick={() => onApprove(item.id)}>אשר</Button>
                  )}
                  {onReject && item.status === "pending" && (
                    <Button size="sm" variant="danger" onClick={() => onReject(item.id)}>דחה</Button>
                  )}
                  {onEdit && <Button size="sm" variant="ghost" onClick={() => onEdit(item.id)}>ערוך</Button>}
                  {onDelete && <Button size="sm" variant="ghost" onClick={() => onDelete(item.id)}>מחק</Button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
