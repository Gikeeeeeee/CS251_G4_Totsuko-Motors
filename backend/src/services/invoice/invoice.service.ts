import { randomUUID } from 'crypto';
import {
  createInvoiceRecord,
  createInvoiceWithDetails,
  findInvoiceByRequestId,
  findInvoiceDetailsByInvoiceId,
  findServiceRequestForInvoice,
} from '../../repo/invoice/invoice.repo';

export type InvoiceDetailItem = {
  details: string;
  amount: number | string;
};

export type CreateInvoiceBody = {
  request_id: string;
  payment_status?: string;
  total_amount?: number | string;
  details?: InvoiceDetailItem[];
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

  const details = await findInvoiceDetailsByInvoiceId(invoice.invoice_id);
  return { ...invoice, details };
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
  const details = Array.isArray(body.details)
    ? body.details.map((detail, index) => {
        const text = normalizeOptionalString(detail.details);
        if (!text) {
          throw new Error(`details[${index}].details is required`);
        }

        const amount = normalizeOptionalNumber(detail.amount, `details[${index}].amount`);
        if (amount === undefined) {
          throw new Error(`details[${index}].amount is required`);
        }

        return { details: text, amount };
      })
    : [];

  const computedTotal = totalAmount ?? (details.length > 0 ? details.reduce((sum, item) => sum + item.amount, 0) : undefined);
  const invoiceId = generateInvoiceId();

  if (details.length > 0) {
    return createInvoiceWithDetails(
      {
        invoiceId,
        requestId,
        paymentStatus,
        totalAmount: computedTotal,
      },
      details.map((detail) => ({
        invoiceId,
        details: detail.details,
        amount: detail.amount,
      })),
    );
  }

  return createInvoiceRecord({
    invoiceId,
    requestId,
    paymentStatus,
    totalAmount: computedTotal,
  });
}
