import { describe, expect, it } from "vitest";
import {
  buildMatchExplanation,
  calculateMatchScore,
  MIN_MATCH_SCORE,
  rankTripsByMatch,
} from "@/lib/utils/match-score";
import { createTrip } from "@/lib/test/fixtures";

describe("calculateMatchScore", () => {
  it("returns a high score when region, difficulty, tags, and accessibility match", () => {
    const trip = createTrip({
      region: "מרכז",
      difficulty: "easy",
      accessibility: 5,
      tags: ["משפחות", "נוף"],
      estimated_price: 0,
    });

    const result = calculateMatchScore(trip, {
      region: "מרכז",
      difficulty: "easy",
      accessibility: 4,
      tags: ["משפחות", "נוף"],
      specialPreferences: ["חינם"],
    });

    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.explanation.some((line) => line.includes("מתאים לאזור"))).toBe(true);
  });

  it("lowers the score when the trip region does not match", () => {
    const trip = createTrip({ region: "נגב" });

    const matched = calculateMatchScore(trip, { region: "נגב" });
    const mismatched = calculateMatchScore(trip, { region: "מרכז" });

    expect(matched.score).toBeGreaterThan(mismatched.score);
  });

  it("uses region group matching when no specific region is set", () => {
    const trip = createTrip({ region: "גליל" });

    const result = calculateMatchScore(trip, { regionGroup: "צפון" });

    expect(result.score).toBeGreaterThan(50);
  });
});

describe("buildMatchExplanation", () => {
  it("includes accessibility and budget lines when set", () => {
    const trip = createTrip({
      accessibility: 4,
      estimated_price: 50,
      tags: ["מים"],
    });

    const lines = buildMatchExplanation(trip, {
      accessibility: 3,
      maxBudget: 100,
      wetTrip: true,
    });

    expect(lines.some((l) => l.includes("נגישות"))).toBe(true);
    expect(lines.some((l) => l.includes("תקציב"))).toBe(true);
    expect(lines.some((l) => l.includes("מים"))).toBe(true);
  });
});

describe("rankTripsByMatch", () => {
  it("sorts trips by descending match score", () => {
    const perfect = createTrip({ id: "perfect", region: "מרכז", difficulty: "easy" });
    const partial = createTrip({ id: "partial", region: "נגב", difficulty: "hard" });
    const prefs = { region: "מרכז" as const, difficulty: "easy" as const };

    const ranked = rankTripsByMatch([partial, perfect], prefs, { minScore: 0 });

    expect(ranked[0]?.trip.id).toBe("perfect");
    expect(ranked[1]?.trip.id).toBe("partial");
  });

  it("filters trips below MIN_MATCH_SCORE by default", () => {
    const weak = createTrip({
      id: "weak",
      region: "נגב",
      difficulty: "hard",
      accessibility: 1,
      tags: [],
    });
    const strong = createTrip({
      id: "strong",
      region: "מרכז",
      difficulty: "easy",
      accessibility: 5,
      tags: ["משפחות"],
    });

    const ranked = rankTripsByMatch([weak, strong], {
      region: "מרכז",
      difficulty: "easy",
      accessibility: 4,
      tags: ["משפחות"],
    });

    expect(ranked.every((r) => r.score >= MIN_MATCH_SCORE)).toBe(true);
    expect(ranked.some((r) => r.trip.id === "strong")).toBe(true);
  });
});
