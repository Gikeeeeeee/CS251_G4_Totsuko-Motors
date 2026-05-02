import { pool } from '../../db';

export type CreatePartUsageRecord = {
  partId: string;
  jobId: string;
  quantity: number;
};

export async function createPartUsageRecord(data: CreatePartUsageRecord) {
  const result = await pool.query(
    `
      INSERT INTO "UsePart" (service_id, part_id, quantity)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    [data.jobId, data.partId, data.quantity],
  );

  return result.rows;
}
