import { describe, expect, it } from "vitest";
import { canHardDeleteContent } from "@/lib/data/content-delete";

describe("canHardDeleteContent", () => {
  const ownerId = "user-1";
  const otherId = "user-2";

  it("blocks everyone from deleting approved or removed content", () => {
    expect(canHardDeleteContent("approved", ownerId, "user", ownerId)).toBe(false);
    expect(canHardDeleteContent("approved", ownerId, "admin", otherId)).toBe(false);
    expect(canHardDeleteContent("removed", ownerId, "user", ownerId)).toBe(false);
    expect(canHardDeleteContent("removed", ownerId, "admin", otherId)).toBe(false);
  });

  it("allows owner to delete draft/pending/rejected", () => {
    expect(canHardDeleteContent("draft", ownerId, "user", ownerId)).toBe(true);
    expect(canHardDeleteContent("pending", ownerId, "user", ownerId)).toBe(true);
    expect(canHardDeleteContent("rejected", ownerId, "user", ownerId)).toBe(true);
  });

  it("blocks non-owner users from deleting others' content", () => {
    expect(canHardDeleteContent("pending", ownerId, "user", otherId)).toBe(false);
  });

  it("allows admin to delete non-approved content", () => {
    expect(canHardDeleteContent("pending", ownerId, "admin", otherId)).toBe(true);
    expect(canHardDeleteContent("rejected", ownerId, "admin", otherId)).toBe(true);
  });
});
