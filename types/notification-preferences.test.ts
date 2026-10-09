import { describe, expect, it } from "vitest";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  isNotificationKindEnabled,
} from "@/types/notification-preferences";

describe("isNotificationKindEnabled", () => {
  it("respects my_content_status", () => {
    const prefs = { ...DEFAULT_NOTIFICATION_PREFERENCES, my_content_status: false };
    expect(isNotificationKindEnabled(prefs, "content_approved")).toBe(false);
    expect(isNotificationKindEnabled(prefs, "content_rejected")).toBe(false);
    expect(isNotificationKindEnabled(prefs, "content_removed")).toBe(false);
    expect(isNotificationKindEnabled(prefs, "report_resolved")).toBe(true);
  });

  it("respects my_reports_status", () => {
    const prefs = { ...DEFAULT_NOTIFICATION_PREFERENCES, my_reports_status: false };
    expect(isNotificationKindEnabled(prefs, "report_rejected")).toBe(false);
    expect(isNotificationKindEnabled(prefs, "content_approved")).toBe(true);
  });

  it("respects comments_on_my_content and ratings_on_my_content", () => {
    const prefs = {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      comments_on_my_content: false,
      ratings_on_my_content: false,
    };
    expect(isNotificationKindEnabled(prefs, "comment_on_my_content")).toBe(false);
    expect(isNotificationKindEnabled(prefs, "rating_on_my_content")).toBe(false);
  });

  it("respects new_approved_content and favorites_updates", () => {
    const prefs = {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      new_approved_content: false,
      favorites_updates: false,
    };
    expect(isNotificationKindEnabled(prefs, "new_approved_place")).toBe(false);
    expect(isNotificationKindEnabled(prefs, "favorite_entity_updated")).toBe(false);
    expect(isNotificationKindEnabled(prefs, "favorite_entity_removed")).toBe(false);
  });
});
