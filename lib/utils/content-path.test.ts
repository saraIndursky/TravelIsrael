import { describe, expect, it } from "vitest";
import { contentKey, placePath, trailPath, tripEditPath, tripPath } from "./content-path";

describe("content paths", () => {
  it("prefers slug over id", () => {
    expect(contentKey({ id: "abc", slug: "ein-gedi" })).toBe("ein-gedi");
    expect(tripPath({ id: "abc", slug: "ein-gedi" })).toBe("/trips/ein-gedi");
    expect(tripEditPath({ id: "abc", slug: "ein-gedi" })).toBe("/trips/ein-gedi/edit");
    expect(placePath({ id: "abc", slug: "masada" })).toBe("/places/masada");
    expect(trailPath({ id: "abc", slug: "nahal-david" })).toBe("/trails/nahal-david");
  });

  it("falls back to id when slug is missing", () => {
    expect(tripPath({ id: "abc" })).toBe("/trips/abc");
  });
});
