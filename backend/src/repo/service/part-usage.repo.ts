import { pool } from '../../db';

export type CreatePartUsageRecord = {
  partId: string;
  jobId: string;
  quantity: number;
};

export async function createPartUsageRecord(data: CreatePartUsageRecord) {
  const result = await pool.query(
    `
      INSERT INTO "use_part" (part_id, job_id, quantity)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    [data.partId, data.jobId, data.quantity],
  );

  return result.rows;
}
