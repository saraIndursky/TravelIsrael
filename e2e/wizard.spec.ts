import { test, expect } from "@playwright/test";
import { hasSupabase } from "./env";

const WIZARD_STEPS_BEFORE_SUMMARY = 6;

test.describe("Wizard flow", () => {
  test.skip(!hasSupabase, "Requires NEXT_PUBLIC_SUPABASE_URL");

  test("completes all steps and shows matched trips", async ({ page }) => {
    await page.goto("/wizard");
    await expect(page.getByRole("navigation", { name: "ניווט בתכנון" })).toBeVisible();

    await page.getByRole("button", { name: "ישראל", exact: true }).click();

    for (let step = 0; step < WIZARD_STEPS_BEFORE_SUMMARY; step += 1) {
      await page.getByRole("button", { name: "הבא" }).click();
    }

    await page.getByRole("button", { name: "מצא לי טיול" }).click();
    await page.waitForURL("**/wizard/results", { timeout: 20_000 });
    await expect(page.getByText(/תוצאה \d+ מתוך \d+/)).toBeVisible({ timeout: 20_000 });
  });
});
