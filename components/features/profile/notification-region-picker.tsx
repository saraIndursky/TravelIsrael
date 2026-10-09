"use client";

import { useEffect, useState } from "react";
import { flattenRegionTree, getRegionTree } from "@/lib/data/regions";
import type { RegionTreeNode } from "@/types/region";
import { PageLoadingSpinner } from "@/components/layout/page-loading";
import { cn } from "@/lib/utils";

interface NotificationRegionPickerProps {
  selectedIds: string[];
  disabled?: boolean;
  onChange: (regionIds: string[]) => void;
}

export function NotificationRegionPicker({
  selectedIds,
  disabled,
  onChange,
}: NotificationRegionPickerProps) {
  const [nodes, setNodes] = useState<Array<RegionTreeNode & { depth: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getRegionTree()
      .then((tree) => {
        if (!cancelled) {
          setNodes(flattenRegionTree(tree).filter((node) => node.is_selectable || node.children?.length));
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function toggleRegion(id: string) {
    if (disabled) return;
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((value) => value !== id));
      return;
    }
    onChange([...selectedIds, id]);
  }

  if (loading) {
    return <PageLoadingSpinner size="sm" className="py-4" />;
  }

  if (nodes.length === 0) {
    return <p className="text-xs text-gray-500">לא נמצאו אזורים לבחירה</p>;
  }

  return (
    <div className="space-y-2 rounded-xl border border-gray-100 bg-white px-3 py-3">
      <p className="text-xs font-medium text-gray-600">אזורים לעדכונים</p>
      <ul className="max-h-48 space-y-1 overflow-y-auto">
        {nodes.map((node) => {
          const checked = selectedIds.includes(node.id);
          return (
            <li key={node.id}>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm transition hover:bg-gray-50",
                  disabled && "pointer-events-none opacity-50"
                )}
                style={{ paddingInlineStart: 8 + node.depth * 12 }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggleRegion(node.id)}
                  className="h-4 w-4 shrink-0 rounded border-gray-300"
                />
                <span className="text-gray-900">{node.name}</span>
              </label>
            </li>
          );
        })}
      </ul>
      {selectedIds.length === 0 && (
        <p className="text-xs text-amber-700">בחר/י לפחות אזור אחד כדי לקבל התראות על תוכן חדש.</p>
      )}
    </div>
  );
}
