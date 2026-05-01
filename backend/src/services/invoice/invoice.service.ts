import { randomUUID } from 'crypto';
import {
  createInvoiceRecord,
  findInvoiceByRequestId,
  findServiceRequestForInvoice,
  findAllInvoices,
  updateInvoicePaymentStatus,
} from '../../repo/invoice/invoice.repo';

export type CreateInvoiceBody = {
  request_id: string;
  payment_status?: string;
  total_amount?: number | string;
};

function generateInvoiceId() {
  return `INV${randomUUID().replace(/-/g, '').slice(0, 7)}`.toUpperCase();
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

function normalizeOptionalString(value: unknown) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function getInvoiceByRequestId(requestId: string) {
  const invoice = await findInvoiceByRequestId(requestId);

  if (!invoice) {
    throw new Error(`Invoice for request_id "${requestId}" not found`);
  }

  return invoice;
}

export async function getAllInvoices() {
  return await findAllInvoices();
}

export async function createInvoice(body: CreateInvoiceBody) {
  const requestId = normalizeOptionalString(body.request_id);

  if (!requestId) {
    throw new Error('request_id is required');
  }

  // ตรวจสอบว่า ServiceRequest นี้มีอยู่จริง
  const serviceRequest = await findServiceRequestForInvoice(requestId);
  if (!serviceRequest) {
    throw new Error(`ServiceRequest with id "${requestId}" not found`);
  }

  // ตรวจสอบว่ายังไม่มี Invoice ของ request นี้อยู่แล้ว
  const existing = await findInvoiceByRequestId(requestId);
  if (existing) {
    throw new Error(`Invoice for request_id "${requestId}" already exists`);
  }

  const totalAmount = normalizeOptionalNumber(body.total_amount, 'total_amount');
  const paymentStatus = normalizeOptionalString(body.payment_status) ?? 'Unpaid';

  return createInvoiceRecord({
    invoiceId: generateInvoiceId(),
    requestId,
    paymentStatus,
    totalAmount,
  });
}

export async function payInvoice(invoiceId: string) {
  if (!invoiceId) throw new Error('invoice_id is required');
  
  const updated = await updateInvoicePaymentStatus(invoiceId, 'Paid');
  if (!updated) {
    throw new Error(`Invoice "${invoiceId}" not found`);
  }
  return updated;
}
