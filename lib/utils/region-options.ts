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

/** One row of a filter dropdown: the value is the region code, or the name for a group heading. */
export interface RegionFilterOption {
  value: string;
  label: string;
}

const FILTER_INDENT = "    ";

/**
 * Rows for a region filter dropdown, in hierarchy order. Unlike the picker used when assigning a
 * region to content, group headings are selectable here: choosing one also matches everything
 * inside it (see {@link expandRegionFilter}). Pending regions are left out, and a single
 * code-less root such as "ישראל" is dropped because "כל האזורים" already stands for it.
 */
export function buildRegionFilterOptions(
  options: readonly RegionPickerOption[]
): RegionFilterOption[] {
  const visible = options.filter((option) => !option.pending);
  const roots = visible.filter((option) => option.depth === 0);
  const dropRoot = roots.length === 1 && !roots[0].code;
  return visible
    .filter((option) => !(dropRoot && option.depth === 0))
    .map((option) => ({
      value: option.code ?? option.name,
      label: `${FILTER_INDENT.repeat(Math.max(0, option.depth - (dropRoot ? 1 : 0)))}${option.name}`,
    }));
}

type RegionFilterSource = Pick<
  RegionRecord,
  "id" | "name" | "code" | "parent_id" | "is_selectable" | "status"
>;

/**
 * The region codes a filter value stands for: the region itself plus every region nested under
 * it. Content stores the code of a single leaf region, so choosing "צפון" has to match its
 * sub-regions too. An unknown value is returned unchanged so older links keep working.
 */
export function expandRegionFilter(
  regions: readonly RegionFilterSource[],
  value: string
): string[] {
  const wanted = value.replace(/\s+/g, " ").trim().toLowerCase();
  if (!wanted) return [];
  const live = regions.filter((region) => region.status !== "rejected");
  const root =
    live.find((region) => region.code?.toLowerCase() === wanted) ??
    live.find((region) => region.name.toLowerCase() === wanted);
  if (!root) return [value];

  const codes = new Set<string>();
  const queue: RegionFilterSource[] = [root];
  const seen = new Set<string>();
  while (queue.length > 0) {
    const current = queue.pop() as RegionFilterSource;
    if (seen.has(current.id)) continue;
    seen.add(current.id);
    if (current.is_selectable && current.code) codes.add(current.code);
    for (const child of live) {
      if (child.parent_id === current.id) queue.push(child);
    }
  }
  return codes.size > 0 ? Array.from(codes) : [value];
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
