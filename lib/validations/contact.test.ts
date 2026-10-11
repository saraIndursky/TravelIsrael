import { describe, expect, it } from "vitest";
import { contactSchema } from "./contact";

const valid = {
  name: "דנה לוי",
  email: "dana@example.com",
  subject: "שאלה על טיול",
  message: "שלום, רציתי לשאול על אחד הטיולים באתר.",
};

describe("contactSchema", () => {
  it("accepts a complete message and trims whitespace", () => {
    const result = contactSchema.safeParse({ ...valid, name: "  דנה לוי  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("דנה לוי");
  });

  it("rejects an invalid e-mail address", () => {
    const result = contactSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects messages that are too short or too long", () => {
    expect(contactSchema.safeParse({ ...valid, message: "קצר" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, message: "א".repeat(2001) }).success).toBe(false);
  });

  it("requires a name and a subject", () => {
    expect(contactSchema.safeParse({ ...valid, name: " " }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, subject: "" }).success).toBe(false);
  });

  it("allows the honeypot field to be present (the API decides what to do with it)", () => {
    expect(contactSchema.safeParse({ ...valid, website: "http://spam" }).success).toBe(true);
  });
});
