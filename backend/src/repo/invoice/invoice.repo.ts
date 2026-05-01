import { pool } from '../../db';

export type CreateInvoiceRecord = {
  invoiceId: string;
  requestId: string;
  paymentStatus?: string;
  totalAmount?: number;
  createdDate?: string;
};

export type CreateInvoiceDetailRecord = {
  invoiceId: string;
  details: string;
  amount: number;
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

  return result.rows[0] ?? null;
}

export async function findInvoiceDetailsByInvoiceId(invoiceId: string) {
  const result = await pool.query(
    `
      SELECT
        invoice_id,
        details,
        amount
      FROM "InvoiceDetail"
      WHERE invoice_id = $1
      ORDER BY details
    `,
    [invoiceId],
  );

  return result.rows;
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

export async function createInvoiceWithDetails(invoiceData: CreateInvoiceRecord, details: CreateInvoiceDetailRecord[]) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const createdInvoice = await client.query(
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
        invoiceData.invoiceId,
        invoiceData.createdDate ?? new Date().toISOString().split('T')[0],
        invoiceData.paymentStatus ?? 'Unpaid',
        invoiceData.totalAmount ?? null,
        invoiceData.requestId,
      ],
    );

    for (const detail of details) {
      await client.query(
        `
          INSERT INTO "InvoiceDetail" (
            invoice_id,
            details,
            amount
          ) VALUES ($1, $2, $3)
        `,
        [detail.invoiceId, detail.details, detail.amount],
      );
    }

    await client.query('COMMIT');
    return createdInvoice.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
