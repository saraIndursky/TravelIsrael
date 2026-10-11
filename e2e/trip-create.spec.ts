import { test, expect } from "@playwright/test";
import { hasE2eUser, hasSupabase } from "./env";
import { loginWithEmail } from "./helpers/auth";

test.describe("Create trip and submit", () => {
  test.skip(!hasSupabase, "Requires NEXT_PUBLIC_SUPABASE_URL");
  test.skip(!hasE2eUser, "Requires E2E_USER_EMAIL and E2E_USER_PASSWORD");

  test("creates a trip with one station and submits for approval", async ({ page }) => {
    const tripName = "E2E בדיקת יצירת טיול";

    await loginWithEmail(page);
    await page.goto("/trips/create");
    await expect(page.getByRole("heading", { name: "בניית טיול מותאם אישית" })).toBeVisible();

    await page.getByPlaceholder("שם הטיול").fill(tripName);
    await page.getByPlaceholder("תיאור קצר לכרטיס הטיול").fill("תיאור קצר לבדיקת E2E של יצירת טיול");
    await page.getByPlaceholder("תיאור הטיול").fill("תיאור מלא לבדיקת E2E — יצירת טיול עם תחנה אחת ושליחה לאישור");
    await page.getByRole("button", { name: "משפחות", exact: true }).click();

    await page.getByRole("button", { name: "הוספת תחנה" }).click();
    const picker = page.locator("div.fixed.inset-0").filter({
      has: page.getByRole("heading", { name: "הוספת תחנה למסלול" }),
    });
    await expect(picker).toBeVisible();
    await expect(picker.getByRole("button", { name: "הוסף", exact: true }).first()).toBeVisible({
      timeout: 20_000,
    });
    await picker.getByRole("button", { name: "הוסף", exact: true }).first().click();

    await page.getByRole("button", { name: "שליחה לאישור" }).click();
    await page.waitForURL(/\/trips\/[^/]+$/, { timeout: 30_000 });
    await expect(page.getByRole("heading", { name: tripName })).toBeVisible({ timeout: 15_000 });
  });
});
