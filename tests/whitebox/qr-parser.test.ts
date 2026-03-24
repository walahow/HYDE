/**
 * Whitebox unit tests for lib/parse-qr-url.ts
 *
 * Pure function — no mocks needed.
 */

import { parseQrUrl } from '@/lib/parse-qr-url';

// A valid CUID-length transaction ID (26 chars) for testing
const VALID_ID = 'clx1234567890abcdefghijklm';
const BASE = 'https://hyde-six.vercel.app';

describe('parseQrUrl()', () => {
  test('1. Valid URL with correct domain and /v/[id] path → returns id', () => {
    const result = parseQrUrl(`${BASE}/v/${VALID_ID}`);
    expect(result).toBe(VALID_ID);
  });

  test('2. Wrong domain URL → returns null', () => {
    expect(parseQrUrl(`https://evil.example.com/v/${VALID_ID}`)).toBeNull();
    expect(parseQrUrl(`https://hydephishing.vercel.app/v/${VALID_ID}`)).toBeNull();
  });

  test('3. URL missing /v/ path segment → returns null', () => {
    expect(parseQrUrl(`${BASE}/${VALID_ID}`)).toBeNull();
    expect(parseQrUrl(`${BASE}/transaction/${VALID_ID}`)).toBeNull();
    expect(parseQrUrl(`${BASE}/`)).toBeNull();
  });

  test('4. Completely invalid string (not a URL) → returns null', () => {
    expect(parseQrUrl('not-a-url')).toBeNull();
    expect(parseQrUrl('hello world')).toBeNull();
    expect(parseQrUrl('12345')).toBeNull();
  });

  test('5. Empty string → returns null', () => {
    expect(parseQrUrl('')).toBeNull();
  });
});
