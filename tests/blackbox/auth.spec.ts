import { test, expect } from '@playwright/test';
import { loginAsStudent, loginAsAdmin, STUDENT_1, ADMIN_1 } from './helpers/auth';

// Resilient selectors that work before AND after data-testid deployment
const nimInput    = '[data-testid="nim-input"], input[type="text"]';
const pwdInput    = '[data-testid="password-input"], input[type="password"]';
const submitBtn   = '[data-testid="submit-button"], button[type="submit"]';
// Error message: data-testid when deployed, otherwise any visible red-styled text
const errorMsg    = '[data-testid="error-message"], .text-red-600 p, p.text-red-600';

// ── Auth Tests ───────────────────────────────────────────────────────────────

test('1. Valid student login → navigates away from /login, not to /admin', async ({ page }) => {
  await loginAsStudent(page);
  await expect(page).not.toHaveURL(/\/login/);
  await expect(page).not.toHaveURL(/\/admin/);
});

test('2. Valid admin login → redirects to /admin area', async ({ page }) => {
  await loginAsAdmin(page);
  await expect(page).toHaveURL(/\/admin/);
  await expect(page).not.toHaveURL(/\/login/);
});

test('3. Wrong password → shows generic error, no standalone "password salah"', async ({ page }) => {
  await page.goto('/login');
  await page.locator(nimInput).first().fill(STUDENT_1.nim);
  await page.locator(pwdInput).first().fill('totally_wrong_password_xyz');
  await page.locator(submitBtn).first().click();

  // Wait for error to appear (still on /login)
  await expect(page).toHaveURL(/\/login/);
  const errorEl = page.locator(errorMsg).first();
  await expect(errorEl).toBeVisible({ timeout: 10000 });

  const text = await errorEl.innerText();
  expect(text).toContain('AUTHENTICATION_FAILED');
  // Must not show a bare "password salah." as the entire message
  expect(text.trim().toLowerCase()).not.toBe('password salah.');
});

test('4. Wrong NIM → same generic error format as wrong password', async ({ page }) => {
  await page.goto('/login');
  await page.locator(nimInput).first().fill('NONEXISTENT_USER_ZZZZ');
  await page.locator(pwdInput).first().fill('somepassword');
  await page.locator(submitBtn).first().click();

  await expect(page).toHaveURL(/\/login/);
  const errorEl = page.locator(errorMsg).first();
  await expect(errorEl).toBeVisible({ timeout: 10000 });
  const text = await errorEl.innerText();
  expect(text).toContain('AUTHENTICATION_FAILED');
});

test('5. Empty form → blocked by HTML required, does not call API', async ({ page }) => {
  let apiCalled = false;
  // Only watch for the actual NextAuth credentials submission endpoint
  await page.route('**/api/auth/callback/credentials**', (route) => {
    apiCalled = true;
    route.continue();
  });

  await page.goto('/login');
  await page.locator(submitBtn).first().click();

  // Browser's native required-field validation prevents submission
  await page.waitForTimeout(800);
  expect(apiCalled).toBe(false);
  await expect(page).toHaveURL(/\/login/);
});

test('6. Unauthenticated visit to /admin → redirected to /login', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login/);
});

test('7. Unauthenticated visit to /student → redirected to /login', async ({ page }) => {
  await page.goto('/student');
  await expect(page).toHaveURL(/\/login/);
});

test('8. Student visiting /admin after login → redirected away from /admin', async ({ page }) => {
  await loginAsStudent(page);
  await page.goto('/admin');
  // Middleware sends student back to /login with ?error=AccessDenied
  await expect(page).not.toHaveURL(/^https:\/\/hyde-six\.vercel\.app\/admin\/?$/);
});

test('9. Admin visiting /student after login → middleware does not redirect from /student root', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/student');
  // The middleware protects /dashboard/student and /admin/:path*, NOT the bare /student route.
  // Visiting /student as admin may render a page but should NOT land on a student-exclusive area.
  // Confirm admin is still authenticated (not bounced to /login)
  await expect(page).not.toHaveURL(/\/login/);
});

test('10. After login, refreshing the page → still logged in (session persists)', async ({ page }) => {
  await loginAsStudent(page);
  const urlBefore = page.url();

  await page.reload();
  await page.waitForLoadState('networkidle');

  // Must stay authenticated — not bounced back to /login
  await expect(page).not.toHaveURL(/\/login/);
});
