import { describe, expect, it } from "vitest";
import { adminListShowsE2eContent, isE2eTestContentName } from "./e2e-content";

describe("e2e content names", () => {
  it("detects the E2E prefix", () => {
    expect(isE2eTestContentName("E2E אישור מקום")).toBe(true);
    expect(isE2eTestContentName("מצדה")).toBe(false);
  });

  it("shows E2E rows in admin only when searching the prefix", () => {
    expect(adminListShowsE2eContent("")).toBe(false);
    expect(adminListShowsE2eContent("מצדה")).toBe(false);
    expect(adminListShowsE2eContent("E2E אישור מקום")).toBe(true);
  });
});
