import type { RegionRecord } from "@/types/region";

/** One row of the hierarchical region picker (depth 0 = top of the tree). */
export interface RegionPickerOption {
  id: string;
  name: string;
  code: string | null;
  depth: number;
  /** Only selectable regions can be assigned to content; the others are group headings. */
  selectable: boolean;
  pending: boolean;
}

/**
 * Flattens the region tree into display order (parents before their children). Rejected regions
 * are left out; pending ones are kept because RLS only returns them to their creator and admins.
 */
export function buildRegionPickerOptions(regions: readonly RegionRecord[]): RegionPickerOption[] {
  const visible = regions.filter((region) => region.status !== "rejected");
  const ids = new Set(visible.map((region) => region.id));
  const byParent = new Map<string | null, RegionRecord[]>();

  for (const region of visible) {
    // A region whose parent isn't visible is shown at the top instead of disappearing.
    const key = region.parent_id && ids.has(region.parent_id) ? region.parent_id : null;
    byParent.set(key, [...(byParent.get(key) ?? []), region]);
  }

  const result: RegionPickerOption[] = [];
  const walk = (parentId: string | null, depth: number) => {
    const children = (byParent.get(parentId) ?? []).sort(
      (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, "he")
    );
    for (const region of children) {
      result.push({
        id: region.id,
        name: region.name,
        code: region.code,
        depth,
        selectable: region.is_selectable && Boolean(region.code),
        pending: region.status === "pending",
      });
      walk(region.id, depth + 1);
    }
  };
  walk(null, 0);
  return result;
}

/** Display label with a non-breaking indent that reflects the depth in the hierarchy. */
export function regionOptionLabel(option: RegionPickerOption): string {
  const indent = "   ".repeat(option.depth);
  return `${indent}${option.name}${option.pending ? " (ממתין לאישור)" : ""}`;
}

/** Finds a selectable region by name, ignoring case, so duplicates aren't proposed. */
export function findSelectableRegion(
  options: readonly RegionPickerOption[],
  name: string
): RegionPickerOption | undefined {
  const wanted = name.replace(/\s+/g, " ").trim().toLowerCase();
  if (!wanted) return undefined;
  return options.find(
    (option) => option.selectable && option.code?.toLowerCase() === wanted
  );
}
