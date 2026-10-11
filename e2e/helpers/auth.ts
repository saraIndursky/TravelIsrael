import type { Page } from "@playwright/test";
import { e2eUserCredentials } from "../env";

export async function loginWithEmail(
  page: Page,
  credentials: { email: string; password: string } = e2eUserCredentials()
): Promise<void> {
  const email = credentials.email.trim().toLowerCase();
  const password = credentials.password;

  await page.goto("/");
  const menu = page.getByRole("button", { name: "תפריט משתמש" }).first();
  if (await menu.isVisible().catch(() => false)) {
    await menu.click();
    const shownEmail = (await page.locator('p[dir="ltr"]').textContent())?.trim().toLowerCase();
    if (shownEmail === email.toLowerCase()) {
      await page.keyboard.press("Escape");
      return;
    }
    await page.getByRole("button", { name: "התנתקות" }).click();
    await page.getByRole("button", { name: "כניסה" }).first().waitFor({ timeout: 15_000 });
  }

  await page.goto("/login");
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: "התחברות" }).click();

  try {
    await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 20_000 });
  } catch {
    throw new Error(
      `ההתחברות נכשלה עבור ${email}. ודא/י שהאימייל והסיסמה ב-.env.local תואמים ל-/login (אימייל באותיות קטנות, סיסמה עם מרכאות אם יש #).`
    );
  }
}

export async function logout(page: Page): Promise<void> {
  const menu = page.getByRole("button", { name: "תפריט משתמש" }).first();
  if (!(await menu.isVisible().catch(() => false))) return;
  await menu.click();
  await page.getByRole("button", { name: "התנתקות" }).click();
  await page.getByRole("button", { name: "כניסה" }).first().waitFor({ timeout: 15_000 });
}
