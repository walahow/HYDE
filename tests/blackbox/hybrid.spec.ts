import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsStudent, loginWith, STUDENT_1, ADMIN_1 } from './helpers/auth';

// ── In-browser API helper ────────────────────────────────────────────────────

async function apiFetch(
  page: import('@playwright/test').Page,
  path: string,
  options: RequestInit = {}
) {
  return page.evaluate(
    async ({ path, options }: { path: string; options: RequestInit }) => {
      const res = await fetch(path, { credentials: 'include', ...options });
      let body: unknown;
      try { body = await res.json(); } catch { body = null; }
      return { status: res.status, body };
    },
    { path, options }
  );
}

async function getAdminId(page: import('@playwright/test').Page, nim = 'ADM-001'): Promise<string> {
  const { body } = await apiFetch(page, '/api/destinations');
  const list = body as any[];
  return (list.find((a: any) => a.nim === nim) ?? list[0]).id as string;
}

async function createHybridInReviewing(
  studentPage: import('@playwright/test').Page,
  adminPage: import('@playwright/test').Page
): Promise<string> {
  const adminId = await getAdminId(studentPage, 'ADM-001');
  const { body: tx } = await apiFetch(studentPage, '/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentType: 'Hybrid TX', adminId, mode: 'HYBRID' }),
  });
  const txId = (tx as any).id as string;
  await apiFetch(adminPage, `/api/transactions/${txId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toStatus: 'REVIEWING' }),
  });
  return txId;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test('1. Admin advances HYBRID transaction (REVIEWING → AWAITING_SCAN)', async ({ page, browser }) => {
  // For HYBRID mode: REVIEWING → AWAITING_SCAN is the valid admin step (not VALIDATED directly)
  const sCtx = await browser.newContext();
  const sPage = await sCtx.newPage();
  await loginWith(sPage, STUDENT_1.nim, STUDENT_1.password);

  await loginAsAdmin(page);
  const txId = await createHybridInReviewing(sPage, page);

  const { status, body } = await apiFetch(page, `/api/transactions/${txId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toStatus: 'AWAITING_SCAN' }),
  });
  expect(status).toBe(200);
  expect((body as any).status).toBe('AWAITING_SCAN');
  await sCtx.close();
});

test('2. Admin generates disposisi on VALIDATED HYBRID → status moves to AWAITING_SCAN', async ({ page, browser }) => {
  // HYBRID flow: REVIEWING → AWAITING_SCAN → scan (VALIDATED) → disposisi → AWAITING_SCAN again
  const sCtx = await browser.newContext();
  const sPage = await sCtx.newPage();
  await loginWith(sPage, STUDENT_1.nim, STUDENT_1.password);

  await loginAsAdmin(page);
  const txId = await createHybridInReviewing(sPage, page);

  // REVIEWING → AWAITING_SCAN
  await apiFetch(page, `/api/transactions/${txId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toStatus: 'AWAITING_SCAN' }),
  });

  // Physical scan → VALIDATED terminal
  await apiFetch(page, `/api/transactions/${txId}/scan`, { method: 'PATCH' });

  // Now admin generates disposisi on VALIDATED → triggers VALIDATED → AWAITING_SCAN
  const { status, body } = await apiFetch(page, `/api/transactions/${txId}/disposisi`);
  expect(status).toBe(200);
  expect((body as any).qrDataUrl).toBeTruthy();

  const { body: txData } = await apiFetch(page, `/api/transactions/${txId}`);
  expect((txData as any).status).toBe('AWAITING_SCAN');
  await sCtx.close();
});

test('3. /admin/scan page loads with camera UI for admin', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/admin/scan');

  // The QR reader container must be present
  await expect(page.locator('#qr-reader')).toBeVisible({ timeout: 10000 });
  // Page must show the scanner header text
  await expect(page.getByText(/DISPOSISI_SCANNER/i)).toBeVisible();
});

test('4. /admin/scan as student → redirected away', async ({ page }) => {
  await loginAsStudent(page);
  await page.goto('/admin/scan');
  // Middleware sends student away from /admin/**
  await expect(page).not.toHaveURL(/\/admin\/scan/);
});

test('5. Mock scan via API → status becomes VALIDATED with scannedAt set', async ({ page, browser }) => {
  const sCtx = await browser.newContext();
  const sPage = await sCtx.newPage();
  await loginWith(sPage, STUDENT_1.nim, STUDENT_1.password);

  await loginAsAdmin(page);
  const txId = await createHybridInReviewing(sPage, page);

  // REVIEWING → AWAITING_SCAN (correct HYBRID path)
  await apiFetch(page, `/api/transactions/${txId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toStatus: 'AWAITING_SCAN' }),
  });

  const { body: before } = await apiFetch(page, `/api/transactions/${txId}`);
  expect((before as any).status).toBe('AWAITING_SCAN');

  // Mock scan: call the PATCH scan endpoint directly (simulates QR scan)
  const { status, body } = await apiFetch(page, `/api/transactions/${txId}/scan`, { method: 'PATCH' });
  expect(status).toBe(200);
  expect((body as any).transaction?.scannedAt).toBeTruthy();

  // Terminal status post-scan (VALIDATED per scan/route.ts, UI may label it COMPLETED/SELESAI)
  const { body: after } = await apiFetch(page, `/api/transactions/${txId}`);
  expect(['COMPLETED', 'VALIDATED']).toContain((after as any).status);
  expect((after as any).scannedAt).toBeTruthy();
  await sCtx.close();
});

test('6. COMPLETED HYBRID on /v/[id] shows physical verification heading', async ({ page, browser }) => {
  const sCtx = await browser.newContext();
  const sPage = await sCtx.newPage();
  await loginWith(sPage, STUDENT_1.nim, STUDENT_1.password);

  await loginAsAdmin(page);
  const txId = await createHybridInReviewing(sPage, page);

  // Full HYBRID flow: REVIEWING → AWAITING_SCAN → scan (VALIDATED)
  await apiFetch(page, `/api/transactions/${txId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ toStatus: 'AWAITING_SCAN' }) });
  await apiFetch(page, `/api/transactions/${txId}/scan`, { method: 'PATCH' });

  // Public /v/[id] — no auth required
  await page.goto(`/v/${txId}`);
  const h1 = page.locator('h1');
  await expect(h1).toBeVisible({ timeout: 15000 });
  // For HYBRID + VALIDATED, /v/[id] shows "SELESAI_TERVERIFIKASI_FISIK"
  const heading = await h1.innerText();
  expect(heading).toMatch(/SELESAI|TERVERIFIKASI|VERIFIED|COMPLETED|PROTOCOL/i);

  // scannedAt timestamp row must be visible
  await expect(page.getByText(/Physical Scan/i)).toBeVisible();
  await sCtx.close();
});

