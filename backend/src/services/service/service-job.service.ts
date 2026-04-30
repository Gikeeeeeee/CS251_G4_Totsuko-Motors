import { randomUUID } from 'crypto';
import {
  createServiceJobRecord,
  findServiceJobDetailById,
  findServiceRequestById,
  updateServiceJobRecord,
  UpdateServiceJobRecord,
} from '../../repo/service/service-job.repo';

export type CreateServiceJobBody = {
  service_details?: string;
  start_time?: string;
  end_time?: string | null;
};

export type UpdateServiceJobBody = {
  service_details?: string;
  job_status?: string;
  labor_cost?: number | string;
  start_time?: string;
  end_time?: string | null;
};

function normalizeOptionalString(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeOptionalNumber(value: unknown, fieldName: string) {
  if (value === undefined) {
    return undefined;
  }

  const normalized = Number(value);

  if (!Number.isFinite(normalized)) {
    throw new Error(`${fieldName} must be a valid number`);
  }

  return normalized;
}

function generateServiceJobId() {
  return `SJ${randomUUID().replace(/-/g, '').slice(0, 8)}`.toUpperCase();
}

export async function createServiceJobForRequest(requestId: string, body: CreateServiceJobBody) {
  const serviceRequest = await findServiceRequestById(requestId);

  if (!serviceRequest) {
    throw new Error('Service request not found');
  }

  const serviceDetails = normalizeOptionalString(body.service_details);
  const startTime = normalizeOptionalString(body.start_time);
  const endTime = normalizeOptionalString(body.end_time);

  return createServiceJobRecord({
    serviceId: generateServiceJobId(),
    requestId,
    serviceDetails: serviceDetails === null ? undefined : serviceDetails,
    startTime: startTime === null ? undefined : startTime,
    endTime,
  });
}

export async function getServiceJobById(serviceId: string) {
  const serviceJob = await findServiceJobDetailById(serviceId);

  if (!serviceJob) {
    throw new Error('Service job not found');
  }

  return serviceJob;
}

export async function updateServiceJobById(serviceId: string, body: UpdateServiceJobBody) {
  const updates: UpdateServiceJobRecord = {};

  const serviceDetails = normalizeOptionalString(body.service_details);
  if (serviceDetails !== undefined && serviceDetails !== null) {
    updates.serviceDetails = serviceDetails;
  }

  const jobStatus = normalizeOptionalString(body.job_status);
  if (jobStatus !== undefined && jobStatus !== null) {
    updates.jobStatus = jobStatus;
  }

  const laborCost = normalizeOptionalNumber(body.labor_cost, 'labor_cost');
  if (laborCost !== undefined) {
    updates.laborCost = laborCost;
  }

  const startTime = normalizeOptionalString(body.start_time);
  if (startTime !== undefined && startTime !== null) {
    updates.startTime = startTime;
  }

  const endTime = normalizeOptionalString(body.end_time);
  if (endTime !== undefined) {
    updates.endTime = endTime;
  }

  if (Object.keys(updates).length === 0) {
    throw new Error('No field to update');
  }

  return updateServiceJobRecord(serviceId, updates);
}
