import { test, expect } from "@playwright/test";
import { hasE2eUser, hasSupabase } from "./env";
import { loginWithEmail, logout } from "./helpers/auth";
import {
  approvePlaceInAdmin,
  ensureAdminPlaces,
  fillCreatePlaceForm,
  submitPlaceForm,
} from "./helpers/places";

test.describe("Place edit then admin approve", () => {
  test.skip(!hasSupabase, "Requires NEXT_PUBLIC_SUPABASE_URL");
  test.skip(!hasE2eUser, "Requires E2E_USER_EMAIL and E2E_USER_PASSWORD");

  test("creates a place and the owner can edit it", async ({ page }) => {
    test.setTimeout(120_000);

    const stamp = Date.now();
    const placeName = `E2E אישור מקום ${stamp}`;
    const shortDescription = "תיאור קצר לבדיקת אישור מקום ב-E2E";
    const editedShort = "תיאור מעודכן אחרי עריכה בזרימת האישור";
    const fullDescription = "תיאור מלא לבדיקת E2E — יצירת מקום, עריכה, ואישור מנהל";

    await loginWithEmail(page);
    await page.goto("/places/create");
    await expect(page.getByRole("heading", { name: "הוספת מקום חדש" })).toBeVisible();

    await fillCreatePlaceForm(page, {
      name: placeName,
      shortDescription,
      fullDescription,
    });
    await submitPlaceForm(page);
    await expect(page.getByRole("heading", { name: placeName })).toBeVisible({ timeout: 15_000 });
    const placeUrl = page.url();

    await page.getByRole("link", { name: "עריכת המקום" }).click();
    await page.waitForURL(/\/places\/[^/]+\/edit$/, { timeout: 15_000, waitUntil: "commit" });
    await expect(page.getByRole("heading", { name: "עריכת מקום" })).toBeVisible({ timeout: 20_000 });
    await page.locator('textarea[name="short_description"]').fill(editedShort);
    await submitPlaceForm(page);
    await expect(page.getByRole("heading", { name: placeName })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(editedShort)).toBeVisible();
    await expect(page).toHaveURL(placeUrl);
  });

  test("admin approves a pending place created by the E2E user", async ({ page }) => {
    test.setTimeout(120_000);

    const stamp = Date.now();
    const placeName = `E2E אישור מקום ${stamp}`;
    const shortDescription = "תיאור קצר לבדיקת אישור מקום ב-E2E";
    const editedShort = "תיאור מעודכן אחרי עריכה בזרימת האישור";
    const fullDescription = "תיאור מלא לבדיקת E2E — יצירת מקום, עריכה, ואישור מנהל";

    await loginWithEmail(page);
    await page.goto("/places/create");
    await fillCreatePlaceForm(page, {
      name: placeName,
      shortDescription,
      fullDescription,
    });
    await submitPlaceForm(page);
    await expect(page.getByRole("heading", { name: placeName })).toBeVisible({ timeout: 15_000 });
    const placeUrl = page.url();

    await page.getByRole("link", { name: "עריכת המקום" }).click();
    await page.waitForURL(/\/places\/[^/]+\/edit$/, { timeout: 15_000, waitUntil: "commit" });
    await page.locator('textarea[name="short_description"]').fill(editedShort);
    await submitPlaceForm(page);

    const isAdmin = await ensureAdminPlaces(page);
    test.skip(!isAdmin, "Requires E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD (E2E_USER is not an admin)");

    await approvePlaceInAdmin(page, placeName);
    await logout(page);
    await page.goto(placeUrl);
    await expect(page.getByRole("heading", { name: placeName })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(editedShort)).toBeVisible();
  });
});
