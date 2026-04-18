import {
  findPurchasingParts,
  PurchasingPartStatus,
} from './repo';

const allowedStatuses: PurchasingPartStatus[] = [
  'Inventory',
  'Nearly Out of Stock',
  'Waiting for delivery',
];

function normalizeStatus(status: unknown) {
  if (status === undefined) {
    return undefined;
  }

  if (typeof status !== 'string') {
    throw new Error('status must be a string');
  }

  const normalized = allowedStatuses.find(
    (allowedStatus) => allowedStatus.toLowerCase() === status.trim().toLowerCase(),
  );

  if (!normalized) {
    throw new Error(`status must be one of: ${allowedStatuses.join(', ')}`);
  }

  return normalized;
}

export async function getPurchasingParts(status: unknown) {
  return findPurchasingParts(normalizeStatus(status));
}
