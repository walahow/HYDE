/**
 * Whitebox ownership tests.
 * Tests that API routes correctly enforce student and admin ownership.
 * Uses the GET /api/transactions/[id] route handler and the scan route.
 */

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { GET } from '@/app/api/transactions/[id]/route';
import { PATCH as scanPATCH } from '@/app/api/transactions/[id]/scan/route';

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockUserFindUnique   = prisma.user.findUnique as jest.Mock;
const mockTxFindUnique     = prisma.transaction.findUnique as jest.Mock;
const mockTxUpdate         = prisma.transaction.update as jest.Mock;
const mockStatusLogCreate  = prisma.statusLog.create as jest.Mock;

function makeGetRequest() {
  return new Request('http://localhost/api/transactions/tx-1') as any;
}
function makeScanRequest() {
  return new Request('http://localhost/api/transactions/tx-1/scan', { method: 'PATCH' }) as any;
}
function makeParams(id = 'tx-1') {
  return { params: Promise.resolve({ id }) };
}

const STUDENT_SESSION = { user: { id: 'student-1', role: 'STUDENT' } };
const ADMIN_SESSION   = { user: { id: 'admin-1',   role: 'ADMIN' } };

// A full transaction fixture (all fields GET route needs)
function makeTx(overrides = {}) {
  return {
    id: 'tx-1',
    documentType: 'Test Doc',
    status: 'DRAFT',
    mode: 'DIGITAL',
    studentId: 'student-1',
    adminId: 'admin-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: null,
    scannedAt: null,
    finalFileUrl: null,
    student: { id: 'student-1', name: 'Ali', nim: 'H1101221001' },
    admin:   { id: 'admin-1',   name: 'Budi', destinationName: 'FEB' },
    files:   [],
    statusLogs: [],
    ...overrides,
  };
}

describe('Ownership checks', () => {
  test('1. Student reads their own transaction → 200', async () => {
    mockGetServerSession.mockResolvedValue(STUDENT_SESSION as any);
    mockUserFindUnique.mockResolvedValue({ role: 'STUDENT' });
    mockTxFindUnique.mockResolvedValue(makeTx({ studentId: 'student-1' }));

    const res = await GET(makeGetRequest(), makeParams() as any);
    expect(res.status).toBe(200);
  });

  test("2. Student reads another student's transaction → 403", async () => {
    mockGetServerSession.mockResolvedValue(STUDENT_SESSION as any);
    mockUserFindUnique.mockResolvedValue({ role: 'STUDENT' });
    // Transaction belongs to a different student
    mockTxFindUnique.mockResolvedValue(makeTx({ studentId: 'student-other' }));

    const res = await GET(makeGetRequest(), makeParams() as any);
    expect(res.status).toBe(403);
  });

  test('3. Assigned admin reads their transaction → 200', async () => {
    mockGetServerSession.mockResolvedValue(ADMIN_SESSION as any);
    mockUserFindUnique.mockResolvedValue({ role: 'ADMIN' });
    mockTxFindUnique.mockResolvedValue(makeTx({ adminId: 'admin-1' }));

    const res = await GET(makeGetRequest(), makeParams() as any);
    expect(res.status).toBe(200);
  });

  test('4. Unassigned admin reads a transaction → 403', async () => {
    mockGetServerSession.mockResolvedValue(ADMIN_SESSION as any);
    mockUserFindUnique.mockResolvedValue({ role: 'ADMIN' });
    // tx is assigned to a different admin
    mockTxFindUnique.mockResolvedValue(makeTx({ adminId: 'admin-other' }));

    const res = await GET(makeGetRequest(), makeParams() as any);
    expect(res.status).toBe(403);
  });

  test('5. Student calls scan endpoint → 403', async () => {
    // requireAuth('ADMIN') throws FORBIDDEN for a STUDENT
    mockGetServerSession.mockResolvedValue(STUDENT_SESSION as any);
    mockUserFindUnique.mockResolvedValue({ role: 'STUDENT' });

    const res = await scanPATCH(makeScanRequest(), makeParams() as any);
    expect(res.status).toBe(403);
  });

  test('6. Non-assigned admin calls scan → 403 (ownership guard)', async () => {
    mockGetServerSession.mockResolvedValue(ADMIN_SESSION as any);
    mockUserFindUnique.mockResolvedValue({ role: 'ADMIN' });
    // tx assigned to a different admin, in AWAITING_SCAN state
    mockTxFindUnique.mockResolvedValue({
      status:  'AWAITING_SCAN',
      mode:    'HYBRID',
      adminId: 'admin-other', // not admin-1
    });

    const res = await scanPATCH(makeScanRequest(), makeParams() as any);
    expect(res.status).toBe(403);
  });
});
