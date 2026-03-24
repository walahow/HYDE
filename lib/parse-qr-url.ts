/**
 * Pure function: extracts the transaction ID from a HYDE QR disposisi URL.
 *
 * Extracted from app/admin/scan/page.tsx (onScanSuccess) so it can be
 * unit-tested in isolation.
 *
 * Valid format: https://hyde-six.vercel.app/v/{id}
 * Returns the  transaction id string, or null if the input is not a valid HYDE QR URL.
 */

const EXPECTED_HOSTNAME =
  process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
    : 'hyde-six.vercel.app';

export function parseQrUrl(raw: string): string | null {
  if (!raw || typeof raw !== 'string') return null;

  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }

  // Domain must match
  if (url.hostname !== EXPECTED_HOSTNAME) return null;

  // Path must be /v/{id}
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts[0] !== 'v' || !parts[1]) return null;

  const id = parts[1];
  // Basic sanity: ID must be at least 10 chars (cuid / uuid length)
  if (id.length < 10) return null;

  return id;
}
