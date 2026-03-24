/**
 * Whitebox unit tests for app/api/blob/proxy/route.ts
 *
 * All external fetch (blob stream) and Prisma calls are mocked.
 */

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { GET } from '@/app/api/blob/proxy/route';

const mockGetServerSession  = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockUserFindUnique    = prisma.user.findUnique as jest.Mock;
const mockFileFindFirst     = prisma.file.findFirst as jest.Mock;

// Mock global fetch for blob streaming
const mockFetch = jest.fn();
global.fetch = mockFetch;

const STUDENT_SESSION = { user: { id: 'student-1', role: 'STUDENT' } };
const ADMIN_SESSION   = { user: { id: 'admin-1',   role: 'ADMIN' } };
const STRANGER_SESSION = { user: { id: 'stranger',  role: 'STUDENT' } };

const BLOB_URL = 'https://example.blob.vercel-storage.com/private.pdf';

function makeRequest(url = BLOB_URL) {
  return new Request(
    `http://localhost/api/blob/proxy?url=${encodeURIComponent(url)}`
  ) as any;
}
function makeRequestNoUrl() {
  return new Request('http://localhost/api/blob/proxy') as any;
}

const FILE_RECORD = {
  id: 'file-1',
  fileUrl: BLOB_URL,
  transaction: {
    studentId: 'student-1',
    adminId:   'admin-1',
  },
};

describe('GET /api/blob/proxy', () => {
  beforeEach(() => {
    process.env.BLOB_READ_WRITE_TOKEN = 'test-token';
  });

  test('1. Missing url param → 400', async () => {
    mockGetServerSession.mockResolvedValue(STUDENT_SESSION as any);
    mockUserFindUnique.mockResolvedValue({ role: 'STUDENT' });

    const res = await GET(makeRequestNoUrl());
    expect(res.status).toBe(400);
  });

  test('2. File record not found in DB → 404', async () => {
    mockGetServerSession.mockResolvedValue(STUDENT_SESSION as any);
    mockUserFindUnique.mockResolvedValue({ role: 'STUDENT' });
    mockFileFindFirst.mockResolvedValue(null);

    const res = await GET(makeRequest());
    expect(res.status).toBe(404);
  });

  test('3. Stranger (not student or admin) requests file → 403', async () => {
    mockGetServerSession.mockResolvedValue(STRANGER_SESSION as any);
    mockUserFindUnique.mockResolvedValue({ role: 'STUDENT' });
    mockFileFindFirst.mockResolvedValue(FILE_RECORD);

    const res = await GET(makeRequest());
    expect(res.status).toBe(403);
  });

  test('4. Transaction student (owner) can access their file → 200 proxied response', async () => {
    mockGetServerSession.mockResolvedValue(STUDENT_SESSION as any);
    mockUserFindUnique.mockResolvedValue({ role: 'STUDENT' });
    mockFileFindFirst.mockResolvedValue(FILE_RECORD);

    const blobBody = new ReadableStream();
    mockFetch.mockResolvedValue({
      ok: true,
      body: blobBody,
      headers: new Headers({ 'Content-Type': 'application/pdf' }),
    } as any);

    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledWith(
      BLOB_URL,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
  });

  test('5. Assigned admin can access the file → 200 proxied response', async () => {
    mockGetServerSession.mockResolvedValue(ADMIN_SESSION as any);
    mockUserFindUnique.mockResolvedValue({ role: 'ADMIN' });
    mockFileFindFirst.mockResolvedValue(FILE_RECORD);

    const blobBody = new ReadableStream();
    mockFetch.mockResolvedValue({
      ok: true,
      body: blobBody,
      headers: new Headers({ 'Content-Type': 'application/pdf' }),
    } as any);

    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
  });
});
