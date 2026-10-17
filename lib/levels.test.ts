import { describe, expect, it } from "vitest";
import { DIFFICULTY_LABELS } from "@/types/enums";
import { getAccessibilityLabel } from "@/lib/utils";
import { getDifficultyColor, getDifficultyLabel } from "@/lib/utils/trip-display";
import { computeTripStats } from "@/lib/utils/trip-calculations";
import {
  ACCESSIBILITY_LEVELS,
  DIFFICULTY_LEVELS,
  difficultyRank,
  applyLevelOverrides,
  getSeedLevels,
  isHardDifficulty,
} from "./levels";

describe("difficulty levels", () => {
  it("has six levels in a strictly increasing order, matching the labels used on cards", () => {
    expect(DIFFICULTY_LEVELS.map((l) => l.sortOrder)).toEqual([1, 2, 3, 4, 5, 6]);
    for (const level of DIFFICULTY_LEVELS) {
      expect(DIFFICULTY_LABELS[level.code]).toBe(level.name);
      expect(level.description.length).toBeGreaterThan(0);
    }
  });

  it("ranks levels and treats hard and challenging as demanding", () => {
    expect(difficultyRank("easy")).toBeLessThan(difficultyRank("easy_medium"));
    expect(difficultyRank("challenging")).toBe(6);
    expect(isHardDifficulty("medium_hard")).toBe(false);
    expect(isHardDifficulty("hard")).toBe(true);
    expect(isHardDifficulty("challenging")).toBe(true);
  });

  it("gives every level its own colour class and accepts a stored code or a Hebrew name", () => {
    const classes = new Set(DIFFICULTY_LEVELS.map((l) => getDifficultyColor(l.code)));
    expect(classes.size).toBe(DIFFICULTY_LEVELS.length);
    expect(getDifficultyLabel("medium_hard")).toBe("בינוני-קשה");
    expect(getDifficultyLabel("מאתגר")).toBe("מאתגר");
    expect(getDifficultyLabel(undefined)).toBe("לא צוין");
  });

  it("picks the hardest trail for a trip using the full scale", () => {
    const trail = (id: string, difficulty: string) =>
      ({ id, difficulty, accessibility: 5, duration_minutes: 60, length_km: 1, estimated_price: 0 }) as never;
    const stats = computeTripStats(
      [
        { id: "s1", trip_id: "t", order_index: 0, station_type: "trail", place_id: null, trail_id: "a" },
        { id: "s2", trip_id: "t", order_index: 1, station_type: "trail", place_id: null, trail_id: "b" },
      ] as never,
      [],
      [trail("a", "medium_hard"), trail("b", "medium")]
    );
    expect(stats.difficulty).toBe("medium_hard");
  });
});

describe("accessibility levels", () => {
  it("covers 1 to 5 with a name and an explanation, and labels by level", () => {
    expect(ACCESSIBILITY_LEVELS.map((l) => l.level)).toEqual([1, 2, 3, 4, 5]);
    for (const level of ACCESSIBILITY_LEVELS) {
      expect(getAccessibilityLabel(level.level)).toBe(level.name);
      expect(level.description.length).toBeGreaterThan(0);
    }
  });
});

describe("applyLevelOverrides", () => {
  it("updates names and explanations in place, including the labels used on cards", () => {
    const before = {
      name: DIFFICULTY_LEVELS.find((l) => l.code === "medium")!.name,
      description: DIFFICULTY_LEVELS.find((l) => l.code === "medium")!.description,
    };
    try {
      applyLevelOverrides({
        accessibility: [{ level: 3, name: "בינונית מאוד", description: "טקסט חדש" }],
        difficulty: [
          { code: "medium", name: "בינוני פלוס", description: "הסבר חדש" },
          { code: "no_such_level", name: "x", description: "y" },
        ],
      });
      expect(getAccessibilityLabel(3)).toBe("בינונית מאוד");
      expect(DIFFICULTY_LABELS.medium).toBe("בינוני פלוס");
      expect(getDifficultyLabel("medium")).toBe("בינוני פלוס");
      expect(DIFFICULTY_LEVELS.find((l) => l.code === "medium")!.description).toBe("הסבר חדש");
      expect(DIFFICULTY_LEVELS).toHaveLength(6);
    } finally {
      applyLevelOverrides({
        accessibility: [
          { level: 3, name: ACCESSIBILITY_LEVELS[2].name === "בינונית מאוד" ? getSeedLevels().accessibility[2].name : ACCESSIBILITY_LEVELS[2].name, description: getSeedLevels().accessibility[2].description },
        ],
        difficulty: [{ code: "medium", ...before }],
      });
    }
  });

  it("ignores rows with an empty name", () => {
    const original = getSeedLevels().difficulty[0].name;
    applyLevelOverrides({ difficulty: [{ code: "easy", name: "  ", description: "x" }] });
    expect(DIFFICULTY_LABELS.easy).toBe(original);
  });

  it("keeps a restorable copy of the original text", () => {
    expect(getSeedLevels().difficulty.map((l) => l.code)).toEqual(DIFFICULTY_LEVELS.map((l) => l.code));
  });
});
