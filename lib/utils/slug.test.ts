import { describe, expect, it } from "vitest";
import { isUuid, slugOrIdColumn, slugifyName, uniqueSlug } from "./slug";

describe("slugifyName", () => {
  it("maps well-known Hebrew names to readable English", () => {
    expect(slugifyName("מצדה")).toBe("masada");
    expect(slugifyName("עין גדי")).toBe("ein-gedi");
    expect(slugifyName("טיול בירושלים")).toBe("trip-in-jerusalem");
    expect(slugifyName("אופניים בשרון")).toBe("ophnayim-basharon");
    expect(slugifyName("שוק מחנה יהודה")).toBe("shuk-machane-yehuda");
    expect(slugifyName("שוק הכרמל")).toBe("shuk-ha-carmel");
    expect(slugifyName("יום מלא בירושלים")).toBe("full-day-in-jerusalem");
    expect(slugifyName("גני הבהאיים")).toBe("ganei-bahai");
  });

  it("does not transliterate vav as v or drop vowels", () => {
    expect(slugifyName("אופניים בשרון")).not.toContain("v");
    expect(slugifyName("שוק מחנה יהודה")).not.toMatch(/shvk|mchnh|yhvdh/);
  });

  it("slugifies latin names", () => {
    expect(slugifyName("Old City Walk")).toBe("old-city-walk");
  });

  it("avoids reserved paths", () => {
    expect(slugifyName("create")).toBe("create-item");
  });
});

describe("uniqueSlug", () => {
  it("appends a counter when taken", () => {
    expect(uniqueSlug("מצדה", new Set(["masada"]))).toBe("masada-2");
  });
});

describe("isUuid", () => {
  it("detects uuid v4", () => {
    expect(isUuid("c0000001-0000-4000-8000-000000000001")).toBe(true);
    expect(isUuid("masada")).toBe(false);
  });
});

describe("slugOrIdColumn", () => {
  it("uses id for uuids and slug otherwise", () => {
    expect(slugOrIdColumn("c0000001-0000-4000-8000-000000000001")).toBe("id");
    expect(slugOrIdColumn("ein-gedi")).toBe("slug");
  });
});
