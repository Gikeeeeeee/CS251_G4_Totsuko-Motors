import { randomUUID } from 'crypto';
import { createServiceRecord } from './repo';

export type CreateServiceBody = {
  vehicle_type?: string;
  color?: string;
  year?: number | string;
  model?: string;
  brand?: string;
  plate_number?: string;
  name?: string;
  phone?: string;
  address?: string;
  email?: string;
  request_status?: string;
  problem_description?: string;
  odometer?: number | string;
};

function generateId(prefix: string) {
  return `${prefix}${randomUUID().replace(/-/g, '').slice(0, 9)}`.toUpperCase();
}

function normalizeOptionalString(value: unknown) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeRequiredString(value: unknown, fieldName: string) {
  const normalized = normalizeOptionalString(value);

  if (!normalized) {
    throw new Error(`${fieldName} is required`);
  }

  return normalized;
}

function normalizeOptionalNumber(value: unknown, fieldName: string) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const normalized = Number(value);

  if (!Number.isFinite(normalized)) {
    throw new Error(`${fieldName} must be a valid number`);
  }

  return normalized;
}

export async function createService(body: CreateServiceBody) {
  const record = {
    customerId: generateId('C'),
    vehicleId: generateId('V'),
    requestId: generateId('R'),
    vehicleType: normalizeOptionalString(body.vehicle_type),
    color: normalizeOptionalString(body.color),
    year: normalizeOptionalNumber(body.year, 'year'),
    model: normalizeOptionalString(body.model),
    brand: normalizeOptionalString(body.brand),
    plateNumber: normalizeRequiredString(body.plate_number, 'plate_number'),
    name: normalizeRequiredString(body.name, 'name'),
    phone: normalizeOptionalString(body.phone),
    address: normalizeOptionalString(body.address),
    email: normalizeOptionalString(body.email),
    requestStatus: normalizeOptionalString(body.request_status) ?? 'Pending',
    problemDescription: normalizeOptionalString(body.problem_description),
    odometer: normalizeOptionalNumber(body.odometer, 'odometer'),
    checkingDate: new Date(),
  };

  return createServiceRecord(record);
}
