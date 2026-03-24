/**
 * Global Jest setup file (setupFilesAfterEnv).
 * Mocks all external dependencies so no test ever hits the real DB or Blob storage.
 */

// ── Mock Prisma ───────────────────────────────────────────────────────────────
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user:        { findUnique: jest.fn(), findFirst: jest.fn() },
    transaction: {
      findUnique: jest.fn(),
      findFirst:  jest.fn(),
      update:     jest.fn(),
      create:     jest.fn(),
    },
    file:      { findFirst: jest.fn(), findUnique: jest.fn(), update: jest.fn(), create: jest.fn() },
    statusLog: { create: jest.fn() },
  },
}));

// ── Mock next-auth ────────────────────────────────────────────────────────────
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

// ── Mock the NextAuth route (required by lib/auth.ts) ─────────────────────────
jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {},
}));

// ── Reset all mocks before each test ─────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
});
