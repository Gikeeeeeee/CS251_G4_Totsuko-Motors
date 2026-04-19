import { createPartUsageRecord } from '../../repo/service/part-usage.repo';

export type CreatePartUsageBody = {
  part_id?: string;
  job_id?: string;
  quantity?: number | string;
};

function normalizeRequiredString(value: unknown, fieldName: string) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${fieldName} required`);
  }

  return value.trim();
}

function normalizeRequiredNumber(value: unknown, fieldName: string) {
  if (value === undefined || value === null || value === '') {
    throw new Error(`${fieldName} required`);
  }

  const normalized = Number(value);

  if (!Number.isFinite(normalized)) {
    throw new Error(`${fieldName} must be a valid number`);
  }

  return normalized;
}

export async function createPartUsage(body: CreatePartUsageBody) {
  const record = {
    partId: normalizeRequiredString(body.part_id, 'part_id'),
    jobId: normalizeRequiredString(body.job_id, 'job_id'),
    quantity: normalizeRequiredNumber(body.quantity, 'quantity'),
  };

  return createPartUsageRecord(record);
}
