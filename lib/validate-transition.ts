/**
 * Pure function: validates whether a status transition is allowed for a given mode.
 *
 * Extracted from app/api/transactions/[id]/status/route.ts so it can be
 * unit-tested in isolation without mocking the entire Next.js request pipeline.
 */

import { DocumentStatus, TransactionMode } from '@prisma/client';

export const ALLOWED_TRANSITIONS: Record<
  TransactionMode,
  Partial<Record<DocumentStatus, DocumentStatus[]>>
> = {
  DIGITAL: {
    DRAFT:     ['REVIEWING'],
    REVIEWING: ['REVISION', 'VALIDATED'],
    REVISION:  ['REVIEWING'],
  },
  HYBRID: {
    DRAFT:        ['REVIEWING'],
    REVIEWING:    ['REVISION', 'AWAITING_SCAN'],
    AWAITING_SCAN:['VALIDATED'],
    REVISION:     ['REVIEWING'],
  },
};

/**
 * Returns true if the transition fromStatus → toStatus is valid for the given mode.
 */
export function validateTransition(
  mode: TransactionMode,
  fromStatus: DocumentStatus,
  toStatus: DocumentStatus
): boolean {
  const allowed = ALLOWED_TRANSITIONS[mode]?.[fromStatus] ?? [];
  return (allowed as DocumentStatus[]).includes(toStatus);
}
