import { describe, expect, it } from "vitest";
import {
  loginSchema,
  registerSchema,
  tripFormSchema,
  wizardSchema,
} from "@/lib/validations";

describe("tripFormSchema", () => {
  it("accepts valid trip form values", () => {
    const result = tripFormSchema.safeParse({
      name: "טיול משפחתי",
      short_description: "תיאור קצר מתאים לטיול",
      full_description: "תיאור מלא וארוך יותר של הטיול המשפחתי",
      tags: ["משפחות"],
      main_image: "",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a name that is too short", () => {
    const result = tripFormSchema.safeParse({
      name: "א",
      short_description: "תיאור קצר מתאים לטיול",
      full_description: "תיאור מלא וארוך יותר של הטיול המשפחתי",
      tags: ["משפחות"],
    });

    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      firstName: "שרה",
      lastName: "כהן",
      email: "sara@example.com",
      password: "password123",
      confirmPassword: "different123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes("confirmPassword"))).toBe(
        true
      );
    }
  });
});

describe("loginSchema", () => {
  it("rejects invalid email addresses", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "secret",
    });

    expect(result.success).toBe(false);
  });
});

describe("wizardSchema", () => {
  it("accepts partial wizard preferences", () => {
    const result = wizardSchema.safeParse({
      region: "מרכז",
      difficulty: "medium",
      accessibility: 3,
    });

    expect(result.success).toBe(true);
  });

  it("rejects accessibility values outside 1-5", () => {
    const result = wizardSchema.safeParse({ accessibility: 6 });
    expect(result.success).toBe(false);
  });
});
