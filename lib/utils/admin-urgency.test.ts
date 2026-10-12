import { describe, expect, it } from "vitest";
import { ageInDays, urgencyTone } from "./admin-urgency";

describe("urgencyTone", () => {
  it("is green when nothing waits or the oldest item is fresh", () => {
    expect(urgencyTone(null)).toBe("green");
    expect(urgencyTone(0.5)).toBe("green");
    expect(urgencyTone(1.9)).toBe("green");
  });

  it("moves from yellow to red as the oldest item ages", () => {
    expect(urgencyTone(2)).toBe("yellow");
    expect(urgencyTone(4)).toBe("orange");
    expect(urgencyTone(7)).toBe("red");
    expect(urgencyTone(30)).toBe("red");
  });

  it("turns faster for urgent queues (reports, messages)", () => {
    expect(urgencyTone(0.5, true)).toBe("green");
    expect(urgencyTone(1, true)).toBe("yellow");
    expect(urgencyTone(2, true)).toBe("orange");
    expect(urgencyTone(3, true)).toBe("red");
  });
});

describe("ageInDays", () => {
  const now = new Date("2026-10-12T12:00:00Z");
  it("measures whole and partial days", () => {
    expect(ageInDays("2026-10-09T12:00:00Z", now)).toBe(3);
    expect(ageInDays("2026-10-12T00:00:00Z", now)).toBe(0.5);
  });
  it("handles missing or invalid dates", () => {
    expect(ageInDays(null, now)).toBeNull();
    expect(ageInDays("not a date", now)).toBeNull();
  });
});
