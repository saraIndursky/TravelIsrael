import { describe, expect, it } from "vitest";
import type { RegionRecord } from "@/types/region";
import {
  buildRegionFilterOptions,
  buildRegionPickerOptions,
  expandRegionFilter,
  findSelectableRegion,
  regionOptionLabel,
} from "./region-options";
import { buildTrailTypeOptions, isNewTrailType } from "./trail-types";

function region(partial: Partial<RegionRecord> & { id: string; name: string }): RegionRecord {
  return {
    code: null,
    parent_id: null,
    sort_order: 0,
    is_selectable: false,
    status: "approved",
    created_by: null,
    created_at: "2026-01-01T00:00:00Z",
    ...partial,
  } as RegionRecord;
}

const regions: RegionRecord[] = [
  region({ id: "il", name: "ישראל" }),
  region({ id: "center", name: "מרכז", parent_id: "il", sort_order: 2 }),
  region({ id: "north", name: "צפון", parent_id: "il", sort_order: 1 }),
  region({ id: "galil", name: "גליל", parent_id: "north", code: "גליל" as never, is_selectable: true }),
  region({ id: "tlv", name: "תל אביב", parent_id: "center", code: "תל אביב" as never, is_selectable: true, status: "pending" }),
  region({ id: "bad", name: "נדחה", parent_id: "center", code: "נדחה" as never, is_selectable: true, status: "rejected" }),
];

describe("buildRegionPickerOptions", () => {
  const options = buildRegionPickerOptions(regions);

  it("orders parents before their children and tracks depth", () => {
    expect(options.map((o) => `${o.depth}:${o.name}`)).toEqual([
      "0:ישראל",
      "1:צפון",
      "2:גליל",
      "1:מרכז",
      "2:תל אביב",
    ]);
  });

  it("only lets leaf regions with a code be selected", () => {
    expect(options.filter((o) => o.selectable).map((o) => o.name)).toEqual(["גליל", "תל אביב"]);
  });

  it("keeps pending regions (marked) and drops rejected ones", () => {
    expect(options.find((o) => o.name === "תל אביב")?.pending).toBe(true);
    expect(options.some((o) => o.name === "נדחה")).toBe(false);
  });

  it("shows a region whose parent is hidden at the top instead of losing it", () => {
    const orphan = buildRegionPickerOptions([region({ id: "x", name: "יתום", parent_id: "missing" })]);
    expect(orphan).toHaveLength(1);
    expect(orphan[0].depth).toBe(0);
  });
});

describe("regionOptionLabel", () => {
  it("indents by depth and marks pending regions", () => {
    const [, , , , tlv] = buildRegionPickerOptions(regions);
    const label = regionOptionLabel(tlv);
    expect(label.startsWith(" ")).toBe(true);
    expect(label).toContain("(ממתין לאישור)");
  });
});

describe("findSelectableRegion", () => {
  const options = buildRegionPickerOptions(regions);

  it("finds an existing region ignoring spacing and case", () => {
    expect(findSelectableRegion(options, "  גליל ")?.code).toBe("גליל");
  });

  it("does not match group headings or unknown names", () => {
    expect(findSelectableRegion(options, "צפון")).toBeUndefined();
    expect(findSelectableRegion(options, "חדש")).toBeUndefined();
  });
});

describe("trail types", () => {
  it("extends the base list with approved types", () => {
    const options = buildTrailTypeOptions(["רכיבה על סוסים", "הליכה"]);
    expect(options).toContain("רכיבה על סוסים");
    expect(options.filter((o) => o === "הליכה")).toHaveLength(1);
  });

  it("flags a type no approved trail uses", () => {
    expect(isNewTrailType("שייט", [])).toBe(true);
    expect(isNewTrailType("הליכה", [])).toBe(false);
    expect(isNewTrailType("שייט", ["שייט"])).toBe(false);
  });
});

describe("expandRegionFilter", () => {
  const tree: RegionRecord[] = [
    region({ id: "il", name: "ישראל" }),
    region({ id: "north", name: "צפון", parent_id: "il", code: "צפון" as never, is_selectable: true }),
    region({ id: "galil", name: "גליל", parent_id: "north", code: "גליל" as never, is_selectable: true }),
    region({ id: "carmel", name: "כרמל", parent_id: "north", code: "כרמל" as never, is_selectable: true }),
    region({ id: "jer", name: "ירושלים והסביבה", parent_id: "il" }),
    region({ id: "jerusalem", name: "ירושלים", parent_id: "jer", code: "ירושלים" as never, is_selectable: true }),
    region({ id: "bad", name: "נדחה", parent_id: "north", code: "נדחה" as never, is_selectable: true, status: "rejected" }),
  ];

  it("includes the region itself and everything nested under it", () => {
    expect(expandRegionFilter(tree, "צפון").sort()).toEqual(["גליל", "כרמל", "צפון"]);
  });

  it("returns just the code for a leaf region", () => {
    expect(expandRegionFilter(tree, "גליל")).toEqual(["גליל"]);
  });

  it("resolves a group heading that has no code of its own", () => {
    expect(expandRegionFilter(tree, "ירושלים והסביבה")).toEqual(["ירושלים"]);
  });

  it("skips rejected regions and keeps unknown values as they are", () => {
    expect(expandRegionFilter(tree, "צפון")).not.toContain("נדחה");
    expect(expandRegionFilter(tree, "אטלנטיס")).toEqual(["אטלנטיס"]);
    expect(expandRegionFilter(tree, "")).toEqual([]);
  });
});

describe("buildRegionFilterOptions", () => {
  it("drops the single root, indents children and keeps headings selectable", () => {
    const options = buildRegionFilterOptions(buildRegionPickerOptions(regions));
    expect(options[0]).toEqual({ value: "צפון", label: "צפון" });
    expect(options.find((o) => o.value === "גליל")?.label).toBe("    גליל");
    expect(options.some((o) => o.value === "ישראל")).toBe(false);
  });

  it("leaves out regions that are still pending approval", () => {
    const options = buildRegionFilterOptions(buildRegionPickerOptions(regions));
    expect(options.some((o) => o.value === "תל אביב")).toBe(false);
  });
});
