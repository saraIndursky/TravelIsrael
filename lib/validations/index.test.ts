import { describe, expect, it } from "vitest";
import {
  loginSchema,
  registerSchema,
  trailFormSchema,
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

describe("trailFormSchema", () => {
  const valid = {
    name: "הר ארבל",
    short_description: "טיפוס תלול עם תצפית על הכנרת",
    full_description: "מסלול מאתגר עם שלבי מתכת ומאחזים בסלע, תצפית מרהיבה על הכנרת",
    region: "גליל",
    trail_type: "הליכה",
    length_km: 4.5,
    duration_minutes: 120,
    difficulty: "hard",
    accessibility: 1,
    tags: ["טבע"],
    estimated_price: 0,
    start_lat: 32.82,
    start_lng: 35.5,
    end_lat: 32.83,
    end_lng: 35.51,
    waypoints: [],
  };

  it("accepts a trail with its contact details", () => {
    const result = trailFormSchema.safeParse({
      ...valid,
      phone: "04-6937666",
      website: "https://www.parks.org.il/arbel",
      contact_note: "הכניסה בתיאום מראש בלבד",
      image_url: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid website and an over-long note", () => {
    expect(trailFormSchema.safeParse({ ...valid, website: "not a url" }).success).toBe(false);
    expect(trailFormSchema.safeParse({ ...valid, website: "javascript:alert(1)" }).success).toBe(false);
    expect(trailFormSchema.safeParse({ ...valid, contact_note: "א".repeat(401) }).success).toBe(false);
  });

  it("accepts the internal proxy path used to show Wikimedia photos, so such a trail can be saved", () => {
    const proxied = `/api/wiki-image?u=${encodeURIComponent("https://upload.wikimedia.org/wikipedia/commons/a/ab/Arbel.jpg")}`;
    expect(trailFormSchema.safeParse({ ...valid, image_url: proxied }).success).toBe(true);
    expect(trailFormSchema.safeParse({ ...valid, image_url: "not-an-address" }).success).toBe(false);
  });
});
