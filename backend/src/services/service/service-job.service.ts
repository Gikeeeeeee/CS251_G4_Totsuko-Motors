import { randomUUID } from 'crypto';
import {
  createServiceJobRecord,
  findServiceJobDetailById,
  findServiceJobsByRequestId,
  findServiceRequestById,
  updateServiceJobRecord,
  replaceUseParts,
  replaceAssignments,
  deleteServiceJobCascade,
  UpdateServiceJobRecord,
  findAssignTo,
  createAssignTo,
  deleteAssignTo,
} from '../../repo/service/service-job.repo';

export type CreateServiceJobBody = {
  service_type?: string;
  service_details?: string;
  start_time?: string;
  end_time?: string | null;
  service_status?: string;
  labor_cost?: number;
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
    serviceType: normalizeOptionalString(body.service_type) ?? 'repair',
    serviceDetails: serviceDetails === null ? undefined : serviceDetails,
    startTime: startTime === null ? undefined : startTime,
    endTime,
    serviceStatus: normalizeOptionalString(body.service_status) ?? undefined,
    laborCost: body.labor_cost,
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

export async function getServiceJobsByRequest(requestId: string) {
  return findServiceJobsByRequestId(requestId);
}

export async function assignTechnician(serviceId: string, technicianId: string) {
  const job = await findServiceJobDetailById(serviceId);
  if (!job) throw new Error('Service job not found');

  const existing = await findAssignTo(serviceId, technicianId);
  if (existing) throw new Error('Technician already assigned to this job');

  return createAssignTo(serviceId, technicianId);
}

export async function replaceServiceJobParts(serviceId: string, parts: Array<{ part_id?: string; quantity?: number | string }>) {
  const job = await findServiceJobDetailById(serviceId);
  if (!job) throw new Error('Service job not found');

  const normalizedParts = (parts || []).map((part) => {
    if (!part.part_id) throw new Error('part_id is required');
    const quantity = Number(part.quantity);
    if (!Number.isFinite(quantity) || quantity < 0) throw new Error('quantity must be a valid non-negative number');
    return { partId: part.part_id, quantity };
  });

  return replaceUseParts(serviceId, normalizedParts);
}

export async function replaceServiceJobTechnicians(serviceId: string, technicianIds: string[]) {
  const job = await findServiceJobDetailById(serviceId);
  if (!job) throw new Error('Service job not found');

  if (!Array.isArray(technicianIds)) {
    throw new Error('technicians is required');
  }

  const normalizedIds = technicianIds.map((id) => {
    if (typeof id !== 'string' || id.trim() === '') {
      throw new Error('technicianId must be a valid string');
    }
    return id.trim();
  });

  return replaceAssignments(serviceId, normalizedIds);
}

export async function removeTechnician(serviceId: string, technicianId: string) {
  const deleted = await deleteAssignTo(serviceId, technicianId);
  if (!deleted) throw new Error('Assignment not found');
  return deleted;
}

export async function deleteServiceJobById(serviceId: string) {
  const job = await findServiceJobDetailById(serviceId);
  if (!job) throw new Error('Service job not found');

  const deleted = await deleteServiceJobCascade(serviceId);
  if (!deleted) throw new Error('Service job deletion failed');
  return deleted;
}
