import { Page } from '@playwright/test';

// ── Seeded credentials (from prisma/seed.ts) ────────────────────────────────
export const STUDENT_1 = { nim: 'H1101221001', password: 'password123' };
export const STUDENT_2 = { nim: 'H1101221042', password: 'password123' };
export const ADMIN_1   = { nim: 'ADM-001',     password: 'password123' };
export const ADMIN_2   = { nim: 'ADM-002',     password: 'password123' };

/**
 * Fill the login form using resilient selectors.
 * Prefers data-testid (when deployed), falls back to attribute selectors
 * so tests work against the current live site too.
 */
async function fillLogin(page: Page, nim: string, password: string) {
  await page.goto('/login');
  // Compound selector: data-testid first, then attribute fallback
  await page.locator('[data-testid="nim-input"], input[type="text"]').first().fill(nim);
  await page.locator('[data-testid="password-input"], input[type="password"]').first().fill(password);
  await page.locator('[data-testid="submit-button"], button[type="submit"]').first().click();
}

/**
 * Login as the primary student. Students land at "/" after login
 * (middleware does not redirect students from the root page).
 */
export async function loginAsStudent(page: Page) {
  await fillLogin(page, STUDENT_1.nim, STUDENT_1.password);
  // Wait for navigation away from /login — students land at "/"
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
}

/** Login as the primary admin. Admins are redirected to /admin. */
export async function loginAsAdmin(page: Page) {
  await fillLogin(page, ADMIN_1.nim, ADMIN_1.password);
  await page.waitForURL(/\/admin/);
}

/**
 * Generic login for any NIM + password.
 * @param waitFor  URL pattern to wait for after clicking submit.
 *                 Defaults to "navigated away from /login".
 */
export async function loginWith(
  page: Page,
  nim: string,
  password: string,
  waitFor?: RegExp
) {
  await fillLogin(page, nim, password);
  if (waitFor) {
    await page.waitForURL(waitFor);
  } else {
    await page.waitForURL((url) => !url.pathname.startsWith('/login'));
  }
}
