/**
 * Whitebox unit tests for app/api/transactions/[id]/scan/route.ts
 *
 * Key fact: scan route sets status → VALIDATED (not COMPLETED),
 * scannedAt and completedAt are both set on success.
 */

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { PATCH } from '@/app/api/transactions/[id]/scan/route';

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockUserFindUnique   = prisma.user.findUnique as jest.Mock;
const mockTxFindUnique     = prisma.transaction.findUnique as jest.Mock;
const mockTxUpdate         = prisma.transaction.update as jest.Mock;
const mockStatusLogCreate  = prisma.statusLog.create as jest.Mock;

const ADMIN_SESSION = { user: { id: 'admin-1', role: 'ADMIN' } };

function mockAdminSession() {
  mockGetServerSession.mockResolvedValue(ADMIN_SESSION as any);
  mockUserFindUnique.mockResolvedValue({ role: 'ADMIN' });
}

function makeRequest() {
  return new Request('http://localhost/api/transactions/tx-1/scan', {
    method: 'PATCH',
  }) as any;
}
function makeParams(id = 'tx-1') {
  return { params: Promise.resolve({ id }) };
}

describe('PATCH /api/transactions/[id]/scan', () => {
  test('1. Returns 400 if transaction mode is DIGITAL (not HYBRID)', async () => {
    mockAdminSession();
    mockTxFindUnique.mockResolvedValue({
      status: 'AWAITING_SCAN',
      mode: 'DIGITAL',   // ← wrong mode
      adminId: 'admin-1',
    });

    const res = await PATCH(makeRequest(), makeParams() as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/HYBRID/i);
  });

  test('2. Returns 400 if transaction status is not AWAITING_SCAN', async () => {
    mockAdminSession();
    mockTxFindUnique.mockResolvedValue({
      status: 'REVIEWING',  // ← wrong status
      mode: 'HYBRID',
      adminId: 'admin-1',
    });

    const res = await PATCH(makeRequest(), makeParams() as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/awaiting/i);
  });

  test('3. Returns 403 if adminId does not match session user id', async () => {
    mockAdminSession();
    mockTxFindUnique.mockResolvedValue({
      status: 'AWAITING_SCAN',
      mode: 'HYBRID',
      adminId: 'admin-other',  // ← different admin
    });

    const res = await PATCH(makeRequest(), makeParams() as any);
    expect(res.status).toBe(403);
  });

  test('4. Returns 404 if transaction does not exist', async () => {
    mockAdminSession();
    mockTxFindUnique.mockResolvedValue(null);

    const res = await PATCH(makeRequest(), makeParams() as any);
    expect(res.status).toBe(404);
  });

  test('5. On success: status = VALIDATED, scannedAt and completedAt are set', async () => {
    mockAdminSession();
    mockTxFindUnique.mockResolvedValue({
      status: 'AWAITING_SCAN',
      mode: 'HYBRID',
      adminId: 'admin-1',
    });
    const now = new Date();
    mockTxUpdate.mockResolvedValue({
      id: 'tx-1',
      documentType: 'Test',
      status: 'VALIDATED',
      scannedAt: now,
      completedAt: now,
      student: { name: 'Ali' },
      admin: { destinationName: 'FEB' },
    });
    mockStatusLogCreate.mockResolvedValue({});

    const res = await PATCH(makeRequest(), makeParams() as any);
    expect(res.status).toBe(200);

    // Verify the update was called with VALIDATED + timestamps
    expect(mockTxUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'VALIDATED',
          scannedAt: expect.any(Date),
          completedAt: expect.any(Date),
        }),
      })
    );
  });

  test('6. On success: StatusLog entry written with AWAITING_SCAN → VALIDATED', async () => {
    mockAdminSession();
    mockTxFindUnique.mockResolvedValue({
      status: 'AWAITING_SCAN',
      mode: 'HYBRID',
      adminId: 'admin-1',
    });
    mockTxUpdate.mockResolvedValue({
      id: 'tx-1', documentType: 'Test', status: 'VALIDATED',
      scannedAt: new Date(), completedAt: new Date(),
      student: { name: 'Ali' }, admin: { destinationName: 'FEB' },
    });
    mockStatusLogCreate.mockResolvedValue({});

    await PATCH(makeRequest(), makeParams() as any);

    expect(mockStatusLogCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        transactionId: 'tx-1',
        changedById:   'admin-1',
        fromStatus:    'AWAITING_SCAN',
        toStatus:      'VALIDATED',
      }),
    });
  });

  test('7. On success: response includes student name and destinationName', async () => {
    mockAdminSession();
    mockTxFindUnique.mockResolvedValue({
      status: 'AWAITING_SCAN',
      mode: 'HYBRID',
      adminId: 'admin-1',
    });
    mockTxUpdate.mockResolvedValue({
      id: 'tx-1', documentType: 'Test Doc', status: 'VALIDATED',
      scannedAt: new Date(), completedAt: new Date(),
      student: { name: 'Ahmad Ali' },
      admin:   { destinationName: 'Fakultas Ekonomi dan Bisnis' },
    });
    mockStatusLogCreate.mockResolvedValue({});

    const res = await PATCH(makeRequest(), makeParams() as any);
    const body = await res.json();

    expect(body.transaction.student.name).toBe('Ahmad Ali');
    expect(body.transaction.admin.destinationName).toBe('Fakultas Ekonomi dan Bisnis');
  });
});
