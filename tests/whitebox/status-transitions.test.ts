/**
 * Whitebox tests for status transition logic.
 * Part A: pure function tests on lib/validate-transition.ts
 * Part B: integration tests on the PATCH /api/transactions/[id]/status route handler
 */

import { validateTransition } from '@/lib/validate-transition';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';

// ── Helpers for route integration tests ──────────────────────────────────────

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockFindUnique       = prisma.transaction.findUnique as jest.Mock;
const mockUserFindUnique   = prisma.user.findUnique as jest.Mock;
const mockTxUpdate         = prisma.transaction.update as jest.Mock;
const mockStatusLogCreate  = prisma.statusLog.create as jest.Mock;

// We import the route handler lazily to ensure mocks are applied first
import { PATCH } from '@/app/api/transactions/[id]/status/route';

function makeRequest(body: object): Request {
  return new Request('http://localhost/api/transactions/tx-1/status', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as any;
}

function makeParams(id = 'tx-1') {
  return { params: Promise.resolve({ id }) };
}

// Default sessions
const STUDENT_SESSION = { user: { id: 'student-1', role: 'STUDENT' } };
const ADMIN_SESSION   = { user: { id: 'admin-1',   role: 'ADMIN'   } };

function mockAdminSession() {
  mockGetServerSession.mockResolvedValue(ADMIN_SESSION as any);
  mockUserFindUnique.mockResolvedValue({ role: 'ADMIN' });
}
function mockStudentSession() {
  mockGetServerSession.mockResolvedValue(STUDENT_SESSION as any);
  mockUserFindUnique.mockResolvedValue({ role: 'STUDENT' });
}

// ── Part A: pure function ─────────────────────────────────────────────────────

describe('validateTransition() — pure function', () => {
  test('DIGITAL: REVIEWING → VALIDATED is allowed', () => {
    expect(validateTransition('DIGITAL', 'REVIEWING', 'VALIDATED')).toBe(true);
  });

  test('DIGITAL: REVIEWING → AWAITING_SCAN is NOT allowed', () => {
    expect(validateTransition('DIGITAL', 'REVIEWING', 'AWAITING_SCAN')).toBe(false);
  });

  test('DIGITAL: AWAITING_SCAN → VALIDATED is NOT allowed (no such DIGITAL state)', () => {
    expect(validateTransition('DIGITAL', 'AWAITING_SCAN', 'VALIDATED')).toBe(false);
  });

  test('HYBRID: REVIEWING → AWAITING_SCAN is allowed', () => {
    expect(validateTransition('HYBRID', 'REVIEWING', 'AWAITING_SCAN')).toBe(true);
  });

  test('HYBRID: AWAITING_SCAN → VALIDATED is allowed', () => {
    expect(validateTransition('HYBRID', 'AWAITING_SCAN', 'VALIDATED')).toBe(true);
  });

  test('HYBRID: REVIEWING → VALIDATED returns false (must go via AWAITING_SCAN)', () => {
    expect(validateTransition('HYBRID', 'REVIEWING', 'VALIDATED')).toBe(false);
  });

  test('Any mode: VALIDATED → anything returns false (terminal state)', () => {
    expect(validateTransition('DIGITAL', 'VALIDATED', 'REVIEWING')).toBe(false);
    expect(validateTransition('HYBRID',  'VALIDATED', 'REVIEWING')).toBe(false);
    expect(validateTransition('DIGITAL', 'VALIDATED', 'DRAFT')).toBe(false);
  });
});

// ── Part B: route handler integration tests ───────────────────────────────────

describe('PATCH /status route handler', () => {
  test('Student attempting REVIEWING → VALIDATED for own DIGITAL tx → 403 (STUDENT can only move REVISION→REVIEWING)', async () => {
    mockStudentSession();
    // Student owns the tx but is trying REVIEWING→VALIDATED which is an ADMIN transition
    mockFindUnique.mockResolvedValue({
      status: 'REVIEWING',
      mode:   'DIGITAL',
      studentId: 'other-student', // not this student's tx
      adminId:   'admin-1',
    });

    const res = await PATCH(makeRequest({ toStatus: 'VALIDATED' }) as any, makeParams() as any);
    expect(res.status).toBe(403);
  });

  test('Admin: DIGITAL REVIEWING → VALIDATED succeeds and sets completedAt', async () => {
    mockAdminSession();
    mockFindUnique.mockResolvedValue({
      status: 'REVIEWING',
      mode:   'DIGITAL',
      studentId: 'student-1',
      adminId:   'admin-1',
    });
    const now = new Date();
    mockTxUpdate.mockResolvedValue({
      id: 'tx-1', status: 'VALIDATED', completedAt: now,
    });
    mockStatusLogCreate.mockResolvedValue({});

    const res = await PATCH(makeRequest({ toStatus: 'VALIDATED' }) as any, makeParams() as any);
    expect(res.status).toBe(200);

    // completedAt must be set in the update payload
    expect(mockTxUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ completedAt: expect.any(Date) }),
      })
    );
  });

  test('Admin: DIGITAL VALIDATED → anything → 400 (terminal state)', async () => {
    mockAdminSession();
    mockFindUnique.mockResolvedValue({
      status:    'VALIDATED',
      mode:      'DIGITAL',
      studentId: 'student-1',
      adminId:   'admin-1',
    });

    const res = await PATCH(makeRequest({ toStatus: 'REVIEWING' }) as any, makeParams() as any);
    expect(res.status).toBe(400);
  });

  test('Admin: HYBRID REVIEWING → AWAITING_SCAN succeeds', async () => {
    mockAdminSession();
    mockFindUnique.mockResolvedValue({
      status:    'REVIEWING',
      mode:      'HYBRID',
      studentId: 'student-1',
      adminId:   'admin-1',
    });
    mockTxUpdate.mockResolvedValue({ id: 'tx-1', status: 'AWAITING_SCAN' });
    mockStatusLogCreate.mockResolvedValue({});

    const res = await PATCH(makeRequest({ toStatus: 'AWAITING_SCAN' }) as any, makeParams() as any);
    expect(res.status).toBe(200);
  });

  test('Admin: HYBRID REVIEWING → VALIDATED → 400 (must go via AWAITING_SCAN)', async () => {
    mockAdminSession();
    mockFindUnique.mockResolvedValue({
      status:    'REVIEWING',
      mode:      'HYBRID',
      studentId: 'student-1',
      adminId:   'admin-1',
    });

    const res = await PATCH(makeRequest({ toStatus: 'VALIDATED' }) as any, makeParams() as any);
    expect(res.status).toBe(400);
  });

  test('HYBRID AWAITING_SCAN → VALIDATED sets completedAt (and scannedAt)', async () => {
    mockAdminSession();
    mockFindUnique.mockResolvedValue({
      status:    'AWAITING_SCAN',
      mode:      'HYBRID',
      studentId: 'student-1',
      adminId:   'admin-1',
    });
    const now = new Date();
    mockTxUpdate.mockResolvedValue({
      id: 'tx-1', status: 'VALIDATED', completedAt: now, scannedAt: now,
    });
    mockStatusLogCreate.mockResolvedValue({});

    const res = await PATCH(makeRequest({ toStatus: 'VALIDATED' }) as any, makeParams() as any);
    expect(res.status).toBe(200);

    // Both completedAt and scannedAt must be set for HYBRID→VALIDATED
    expect(mockTxUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          completedAt: expect.any(Date),
          scannedAt:   expect.any(Date),
        }),
      })
    );
  });
});
