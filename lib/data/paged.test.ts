import { describe, expect, it } from "vitest";
import { buildSearchFilter, pageRange, toPage } from "./paged";

describe("pageRange", () => {
  it("maps a page number to an inclusive database range", () => {
    expect(pageRange(0, 12)).toEqual({ from: 0, to: 11 });
    expect(pageRange(2, 12)).toEqual({ from: 24, to: 35 });
  });
});

describe("toPage", () => {
  it("reports whether more rows exist after this page", () => {
    expect(toPage(new Array(12).fill(1), 34, 0, 12).hasMore).toBe(true);
    expect(toPage(new Array(10).fill(1), 34, 2, 12).hasMore).toBe(false);
  });

  it("falls back to the page length when the count is missing", () => {
    expect(toPage([1, 2, 3], null, 0, 12)).toEqual({ items: [1, 2, 3], total: 3, hasMore: false });
  });
});

describe("buildSearchFilter", () => {
  it("returns null for empty input", () => {
    expect(buildSearchFilter(undefined)).toBeNull();
    expect(buildSearchFilter("   ")).toBeNull();
  });

  it("searches name, description and exact tag for a single word", () => {
    expect(buildSearchFilter("ים")).toBe("name.ilike.%ים%,short_description.ilike.%ים%,tags.cs.{ים}");
  });

  it("skips the tag match for multi-word searches", () => {
    expect(buildSearchFilter("מכתש רמון")).toBe(
      "name.ilike.%מכתש רמון%,short_description.ilike.%מכתש רמון%"
    );
  });

  it("strips characters that could change the structure of the filter", () => {
    const filter = buildSearchFilter('a,b),name.eq.x("%*');
    expect(filter).not.toMatch(/[()"*]/);
    expect(filter?.split(",")).toHaveLength(2);
  });
});
