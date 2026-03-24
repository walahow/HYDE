/**
 * Whitebox unit tests for lib/auth.ts → requireAuth()
 *
 * All external deps are mocked in tests/whitebox/setup.ts
 */

import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockFindUnique       = prisma.user.findUnique as jest.Mock;

// ── Fixtures ──────────────────────────────────────────────────────────────────

const STUDENT_SESSION = {
  user: { id: 'student-1', role: 'STUDENT', name: 'Ali', email: 'ali@test.com' },
};
const ADMIN_SESSION = {
  user: { id: 'admin-1', role: 'ADMIN', name: 'Budi', email: 'budi@test.com' },
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('requireAuth()', () => {
  test('1. Returns session when valid session and DB user exist (no role required)', async () => {
    mockGetServerSession.mockResolvedValue(STUDENT_SESSION as any);
    mockFindUnique.mockResolvedValue({ role: 'STUDENT' });

    const session = await requireAuth();
    expect(session).toEqual(STUDENT_SESSION);
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: 'student-1' },
      select: { role: true },
    });
  });

  test('2. Throws UNAUTHORIZED when no session exists', async () => {
    mockGetServerSession.mockResolvedValue(null);

    await expect(requireAuth()).rejects.toThrow('UNAUTHORIZED');
    // DB must NOT be queried when there is no session
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  test('3. Throws FORBIDDEN when DB role does not match required role', async () => {
    mockGetServerSession.mockResolvedValue(STUDENT_SESSION as any);
    mockFindUnique.mockResolvedValue({ role: 'STUDENT' });

    // Requesting ADMIN role but user is STUDENT
    await expect(requireAuth('ADMIN')).rejects.toThrow('FORBIDDEN');
  });

  test('4. Throws UNAUTHORIZED when user no longer exists in DB (deleted user)', async () => {
    mockGetServerSession.mockResolvedValue(STUDENT_SESSION as any);
    mockFindUnique.mockResolvedValue(null); // user deleted

    await expect(requireAuth()).rejects.toThrow('UNAUTHORIZED');
  });

  test('5. Uses DB role for verification — not the JWT role', async () => {
    // Session says STUDENT, but DB now says ADMIN (role upgrade)
    mockGetServerSession.mockResolvedValue(STUDENT_SESSION as any);
    mockFindUnique.mockResolvedValue({ role: 'ADMIN' });

    // requireAuth('ADMIN') should PASS because DB role is ADMIN
    const session = await requireAuth('ADMIN');
    expect(session).toEqual(STUDENT_SESSION);
  });
});
