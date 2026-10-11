import { describe, expect, it } from "vitest";
import {
  BASE_PLACE_TYPES,
  MAX_PLACE_TYPE_LENGTH,
  buildPlaceTypeOptions,
  isNewPlaceType,
  normalizePlaceType,
  resolvePlaceType,
} from "./place-types";

describe("normalizePlaceType", () => {
  it("trims, collapses spaces and limits the length", () => {
    expect(normalizePlaceType("  מעיין   טבעי ")).toBe("מעיין טבעי");
    expect(normalizePlaceType("א".repeat(100))).toHaveLength(MAX_PLACE_TYPE_LENGTH);
  });
});

describe("buildPlaceTypeOptions", () => {
  it("returns the base types when nothing else is approved", () => {
    expect(buildPlaceTypeOptions([])).toEqual([...BASE_PLACE_TYPES]);
  });

  it("appends approved custom types once, sorted, and never offers the generic type", () => {
    const options = buildPlaceTypeOptions(["מעיין", "אחר", "נמל", "מעיין", "חוף", ""]);
    expect(options.slice(-2)).toEqual(["מעיין", "נמל"]);
    expect(options).not.toContain("אחר");
    expect(options.filter((o) => o === "חוף")).toHaveLength(1);
  });
});

describe("resolvePlaceType", () => {
  it("reuses the existing spelling ignoring case", () => {
    expect(resolvePlaceType("Cave", ["cave", "חוף"])).toBe("cave");
  });

  it("keeps a genuinely new type and returns empty for blank input", () => {
    expect(resolvePlaceType(" מעיין ", [...BASE_PLACE_TYPES])).toBe("מעיין");
    expect(resolvePlaceType("   ", [...BASE_PLACE_TYPES])).toBe("");
  });
});

describe("isNewPlaceType", () => {
  it("flags a type that no approved place uses", () => {
    expect(isNewPlaceType("מעיין", [])).toBe(true);
  });

  it("does not flag base types, the generic type or already approved types", () => {
    expect(isNewPlaceType("חוף", [])).toBe(false);
    expect(isNewPlaceType("אחר", [])).toBe(false);
    expect(isNewPlaceType("מעיין", ["מעיין"])).toBe(false);
  });
});
