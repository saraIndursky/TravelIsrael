import { test, expect } from "@playwright/test";
import { hasE2eUser, hasSupabase } from "./env";
import { loginWithEmail } from "./helpers/auth";

test.describe("Login and profile", () => {
  test.skip(!hasSupabase, "Requires NEXT_PUBLIC_SUPABASE_URL");
  test.skip(!hasE2eUser, "Requires E2E_USER_EMAIL and E2E_USER_PASSWORD");

  test("logs in and opens the personal area", async ({ page }) => {
    await loginWithEmail(page);
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "האזור האישי שלי" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('input[type="email"]')).not.toHaveValue("");
  });
});
