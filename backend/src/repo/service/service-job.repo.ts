import { pool } from '../../db';

export type CreateServiceJobRecord = {
  serviceId: string;
  requestId: string;
  serviceDetails?: string;
  startTime?: string;
  endTime?: string | null;
};

export type UpdateServiceJobRecord = {
  serviceDetails?: string;
  jobStatus?: string;
  laborCost?: number;
  startTime?: string;
  endTime?: string | null;
};

type UpdateColumn = {
  column: string;
  value: string | number | null | undefined;
};

export async function findServiceRequestById(requestId: string) {
  const result = await pool.query(
    `
      SELECT request_id
      FROM "ServiceRequest"
      WHERE request_id = $1
      LIMIT 1
    `,
    [requestId],
  );

  return result.rows[0];
}

export async function createServiceJobRecord(data: CreateServiceJobRecord) {
  const result = await pool.query(
    `
      INSERT INTO "ServiceJob" (
        service_id,
        start_time,
        service_details,
        job_status,
        labor_cost,
        end_time,
        request_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
    [
      data.serviceId,
      data.startTime ?? null,
      data.serviceDetails ?? null,
      null,
      null,
      data.endTime ?? null,
      data.requestId,
    ],
  );

  return result.rows[0];
}

export async function updateServiceJobRecord(serviceId: string, updates: UpdateServiceJobRecord) {
  const columns: UpdateColumn[] = [
    { column: 'service_details', value: updates.serviceDetails },
    { column: 'job_status', value: updates.jobStatus },
    { column: 'labor_cost', value: updates.laborCost },
    { column: 'start_time', value: updates.startTime },
    { column: 'end_time', value: updates.endTime },
  ].filter((update) => update.value !== undefined);

  const assignments = columns.map((update, index) => `"${update.column}" = $${index + 1}`);
  const values = columns.map((update) => update.value);

  const result = await pool.query(
    `
      UPDATE "ServiceJob"
      SET ${assignments.join(', ')}
      WHERE service_id = $${values.length + 1}
      RETURNING *
    `,
    [...values, serviceId],
  );

  return result.rows;
}
