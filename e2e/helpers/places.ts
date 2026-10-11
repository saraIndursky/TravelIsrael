import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { e2eAdminCredentials } from "../env";
import { loginWithEmail, logout } from "./auth";

export async function fillCreatePlaceForm(
  page: Page,
  values: { name: string; shortDescription: string; fullDescription: string }
): Promise<void> {
  await page.locator('input[name="name"]').fill(values.name);
  await page.locator('textarea[name="short_description"]').fill(values.shortDescription);
  await page.locator('textarea[name="full_description"]').fill(values.fullDescription);
  await page.getByRole("button", { name: "טבע", exact: true }).click();
  await page.locator('input[name="address"]').fill("רחוב הבדיקה 1, תל אביב");
  await page.locator('select[name="region"]').selectOption("מרכז");
  await page.locator('select[name="place_type"]').selectOption("פארק");
}

export async function submitPlaceForm(page: Page): Promise<void> {
  await page.getByRole("button", { name: /שמירה ושליחה|שמירת שינויים/ }).click();
  await page.waitForURL(
    (url) => /^\/places\/[^/]+$/.test(url.pathname) && url.pathname !== "/places/create",
    { timeout: 30_000, waitUntil: "domcontentloaded" }
  );
}

export async function ensureAdminPlaces(page: Page): Promise<boolean> {
  const adminHeading = page.getByRole("heading", { name: "ניהול מקומות" });
  const gate = page.getByRole("heading", { name: "גישה מוגבלת" });

  await page.goto("/admin/places");
  await expect(adminHeading.or(gate)).toBeVisible({ timeout: 20_000 });

  try {
    await expect(adminHeading).toBeVisible({ timeout: 8_000 });
    return true;
  } catch {
    // role hydrated as non-admin — switch to the admin account
  }

  await logout(page);
  await loginWithEmail(page, e2eAdminCredentials());
  await page.goto("/admin/places");
  try {
    await expect(adminHeading).toBeVisible({ timeout: 20_000 });
    return true;
  } catch {
    return false;
  }
}

export async function openAdminPlaceTab(
  page: Page,
  tab: "מאושרים" | "ממתינים לאישור" | "נדחו",
  placeName: string
): Promise<void> {
  await page.getByRole("button", { name: new RegExp(`^${tab}`) }).click();
  await page.getByPlaceholder("חיפוש לפי שם או אזור...").fill(placeName);
  await expect(page.getByText(placeName, { exact: true }).first()).toBeVisible({
    timeout: 20_000,
  });
}

export async function approvePlaceInAdmin(page: Page, placeName: string): Promise<void> {
  await openAdminPlaceTab(page, "ממתינים לאישור", placeName);
  await page.locator("tr", { hasText: placeName }).getByRole("button", { name: "אישור" }).click();
  await expect(page.getByText("המקום אושר", { exact: true })).toBeVisible({ timeout: 15_000 });
}

export async function rejectPlaceInAdmin(page: Page, placeName: string, reason: string): Promise<void> {
  await openAdminPlaceTab(page, "ממתינים לאישור", placeName);
  await page.locator("tr", { hasText: placeName }).getByRole("button", { name: "דחייה" }).click();
  await page.getByPlaceholder("הסבר למשתמש מדוע נדחה...").fill(reason);
  await page.getByRole("button", { name: "דחייה", exact: true }).click();
  await expect(page.getByText("המקום נדחה", { exact: true })).toBeVisible({ timeout: 15_000 });
}

export async function switchToUser(page: Page): Promise<void> {
  await logout(page);
  await loginWithEmail(page);
}
