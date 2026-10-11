import { describe, expect, it } from "vitest";
import type { RegionRecord } from "@/types/region";
import {
  buildRegionPickerOptions,
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
