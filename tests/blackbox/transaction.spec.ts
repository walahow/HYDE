import { test, expect } from '@playwright/test';
import { loginAsStudent, loginAsAdmin, loginWith, STUDENT_1, STUDENT_2, ADMIN_1 } from './helpers/auth';

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

/** Fetch the destination list and return the first admin whose nim matches, or first in list. */
async function getAdminId(page: import('@playwright/test').Page, nim = 'ADM-001'): Promise<string> {
  const { body } = await apiFetch(page, '/api/destinations');
  const list = body as any[];
  const found = list.find((a: any) => a.nim === nim) ?? list[0];
  return found.id as string;
}

/** Create a DRAFT transaction and return its id. */
async function createTransaction(
  page: import('@playwright/test').Page,
  adminId: string,
  mode: 'DIGITAL' | 'HYBRID' = 'DIGITAL',
  label = 'Test Doc'
): Promise<string> {
  const { body } = await apiFetch(page, '/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentType: label, adminId, mode }),
  });
  return (body as any).id as string;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test('1. Student creates DIGITAL transaction → status is DRAFT', async ({ page }) => {
  await loginAsStudent(page);
  const adminId = await getAdminId(page);
  const { status, body } = await apiFetch(page, '/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentType: 'Proposal Penelitian', adminId, mode: 'DIGITAL' }),
  });
  expect(status).toBe(201);
  expect((body as any).status).toBe('DRAFT');
  expect((body as any).mode).toBe('DIGITAL');
});

test('2. Student creates HYBRID transaction → status is DRAFT', async ({ page }) => {
  await loginAsStudent(page);
  const adminId = await getAdminId(page);
  const { status, body } = await apiFetch(page, '/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentType: 'Surat Aktif', adminId, mode: 'HYBRID' }),
  });
  expect(status).toBe(201);
  expect((body as any).status).toBe('DRAFT');
  expect((body as any).mode).toBe('HYBRID');
});

test("3. Student A cannot see Student B's transaction → 403", async ({ page, browser }) => {
  // Student 1 creates a transaction
  await loginAsStudent(page);
  const adminId = await getAdminId(page);
  const txId = await createTransaction(page, adminId, 'DIGITAL', 'TxPrivate');

  // Student 2 tries to read it
  const ctx2 = await browser.newContext();
  const page2 = await ctx2.newPage();
  await loginWith(page2, STUDENT_2.nim, STUDENT_2.password);

  const { status } = await apiFetch(page2, `/api/transactions/${txId}`);
  expect(status).toBe(403);
  await ctx2.close();
});

test('4. Admin can see their assigned transaction', async ({ page, browser }) => {
  // Student creates a transaction assigned to Admin 1
  const sCtx = await browser.newContext();
  const sPage = await sCtx.newPage();
  await loginWith(sPage, STUDENT_1.nim, STUDENT_1.password);
  const adminId = await getAdminId(sPage, 'ADM-001');
  const txId = await createTransaction(sPage, adminId, 'DIGITAL', 'TxAdmin4');
  await sCtx.close();

  // Admin 1 logs in and verifies they see it
  await loginAsAdmin(page);
  const { body } = await apiFetch(page, '/api/transactions');
  const found = (body as any[]).some((t: any) => t.id === txId);
  expect(found).toBe(true);
});

test('5. Admin claims transaction (DRAFT → REVIEWING)', async ({ page, browser }) => {
  const sCtx = await browser.newContext();
  const sPage = await sCtx.newPage();
  await loginWith(sPage, STUDENT_1.nim, STUDENT_1.password);
  const adminId = await getAdminId(sPage, 'ADM-001');
  const txId = await createTransaction(sPage, adminId, 'DIGITAL', 'Tx5');
  await sCtx.close();

  await loginAsAdmin(page);
  const { status, body } = await apiFetch(page, `/api/transactions/${txId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toStatus: 'REVIEWING' }),
  });
  expect(status).toBe(200);
  expect((body as any).status).toBe('REVIEWING');
});

test('6. Admin sends to REVISION → student sees REVISION status', async ({ page, browser }) => {
  const sCtx = await browser.newContext();
  const sPage = await sCtx.newPage();
  await loginWith(sPage, STUDENT_1.nim, STUDENT_1.password);
  const adminId = await getAdminId(sPage, 'ADM-001');
  const txId = await createTransaction(sPage, adminId, 'DIGITAL', 'Tx6');

  await loginAsAdmin(page);
  await apiFetch(page, `/api/transactions/${txId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ toStatus: 'REVIEWING' }) });
  const { status } = await apiFetch(page, `/api/transactions/${txId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ toStatus: 'REVISION', note: 'Please fix.' }) });
  expect(status).toBe(200);

  // Student sees REVISION
  const { body: txData } = await apiFetch(sPage, `/api/transactions/${txId}`);
  expect((txData as any).status).toBe('REVISION');
  await sCtx.close();
});

test('7. Student resubmits from REVISION → status moves back to REVIEWING', async ({ page, browser }) => {
  const sCtx = await browser.newContext();
  const sPage = await sCtx.newPage();
  await loginWith(sPage, STUDENT_1.nim, STUDENT_1.password);
  const adminId = await getAdminId(sPage, 'ADM-001');
  const txId = await createTransaction(sPage, adminId, 'DIGITAL', 'Tx7');

  await loginAsAdmin(page);
  await apiFetch(page, `/api/transactions/${txId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ toStatus: 'REVIEWING' }) });
  await apiFetch(page, `/api/transactions/${txId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ toStatus: 'REVISION' }) });

  // Student resubmits: REVISION → REVIEWING (the allowed /status endpoint transition)
  const { status, body } = await apiFetch(sPage, `/api/transactions/${txId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toStatus: 'REVIEWING' }),
  });
  expect(status).toBe(200);
  expect((body as any).status).toBe('REVIEWING');
  await sCtx.close();
});


test('8. Admin approves DIGITAL transaction (REVIEWING → VALIDATED)', async ({ page, browser }) => {
  const sCtx = await browser.newContext();
  const sPage = await sCtx.newPage();
  await loginWith(sPage, STUDENT_1.nim, STUDENT_1.password);
  const adminId = await getAdminId(sPage, 'ADM-001');
  const txId = await createTransaction(sPage, adminId, 'DIGITAL', 'Tx8');
  await sCtx.close();

  await loginAsAdmin(page);
  await apiFetch(page, `/api/transactions/${txId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ toStatus: 'REVIEWING' }) });
  const { status, body } = await apiFetch(page, `/api/transactions/${txId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ toStatus: 'VALIDATED' }) });
  expect(status).toBe(200);
  expect((body as any).status).toBe('VALIDATED');
});

test('9. DIGITAL VALIDATED transaction shows complete for student', async ({ page, browser }) => {
  const sCtx = await browser.newContext();
  const sPage = await sCtx.newPage();
  await loginWith(sPage, STUDENT_1.nim, STUDENT_1.password);
  const adminId = await getAdminId(sPage, 'ADM-001');
  const txId = await createTransaction(sPage, adminId, 'DIGITAL', 'Tx9');

  await loginAsAdmin(page);
  await apiFetch(page, `/api/transactions/${txId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ toStatus: 'REVIEWING' }) });
  await apiFetch(page, `/api/transactions/${txId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ toStatus: 'VALIDATED' }) });

  const { body: txData } = await apiFetch(sPage, `/api/transactions/${txId}`);
  expect((txData as any).status).toBe('VALIDATED');
  await sCtx.close();
});
