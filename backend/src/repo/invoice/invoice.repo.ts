import { pool } from '../../db';

export type CreateInvoiceRecord = {
  invoiceId: string;
  requestId: string;
  paymentStatus?: string;
  totalAmount?: number;
  createdDate?: string;
};

export async function findInvoiceByRequestId(requestId: string) {
  const result = await pool.query(
    `
      SELECT
        i.invoice_id,
        i.created_date,
        i.payment_status,
        i.total_amount,
        i.request_id
      FROM "Invoice" i
      WHERE i.request_id = $1
      LIMIT 1
    `,
    [requestId],
  );

  const invoice = result.rows[0] ?? null;

  if (invoice) {
    const detailsResult = await pool.query(
      `
        SELECT details, amount
        FROM "InvoiceDetail"
        WHERE invoice_id = $1
      `,
      [invoice.invoice_id]
    );
    invoice.invoiceDetails = detailsResult.rows;
  }

  return invoice;
}

export async function findServiceRequestForInvoice(requestId: string) {
  const result = await pool.query(
    `
      SELECT request_id
      FROM "ServiceRequest"
      WHERE request_id = $1
      LIMIT 1
    `,
    [requestId],
  );

  return result.rows[0] ?? null;
}

export async function createInvoiceRecord(data: CreateInvoiceRecord) {
  const result = await pool.query(
    `
      INSERT INTO "Invoice" (
        invoice_id,
        created_date,
        payment_status,
        total_amount,
        request_id
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [
      data.invoiceId,
      data.createdDate ?? new Date().toISOString().split('T')[0],
      data.paymentStatus ?? 'Unpaid',
      data.totalAmount ?? null,
      data.requestId,
    ],
  );

  return result.rows[0];
}

export async function findAllInvoices() {
  const result = await pool.query(`
    SELECT
      i.invoice_id,
      i.created_date,
      i.payment_status,
      i.total_amount,
      i.request_id,
      c.name AS customer_name,
      sr.problem_description,
      v.brand,
      v.model,
      v.year,
      v.plate_number,
      v.color,
      (
        SELECT COALESCE(json_agg(
          json_build_object(
            'details', id.details,
            'amount', id.amount
          )
        ), '[]'::json)
        FROM "InvoiceDetail" id
        WHERE id.invoice_id = i.invoice_id
      ) AS invoice_details
    FROM "Invoice" i
    LEFT JOIN "ServiceRequest" sr ON i.request_id = sr.request_id
    LEFT JOIN "Customer" c ON sr.customer_id = c.customer_id
    LEFT JOIN "Vehicle" v ON sr.vehicle_id = v.vehicle_id
    ORDER BY i.created_date DESC, i.invoice_id DESC
  `);
  
  return result.rows;
}

export async function updateInvoicePaymentStatus(invoiceId: string, status: string) {
  const result = await pool.query(
    `
      UPDATE "Invoice"
      SET payment_status = $1
      WHERE invoice_id = $2
      RETURNING *
    `,
    [status, invoiceId]
  );
  return result.rows[0] ?? null;
}
