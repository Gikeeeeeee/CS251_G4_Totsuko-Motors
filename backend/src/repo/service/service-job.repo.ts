import { pool } from '../../db';

export type CreateServiceJobRecord = {
  serviceId: string;
  requestId: string;
  serviceType?: string;
  serviceDetails?: string;
  startTime?: string;
  endTime?: string | null;
  serviceStatus?: string;
  laborCost?: number;
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

export async function findServiceJobDetailById(serviceId: string) {
  const result = await pool.query(
    `
      SELECT
        sj.service_id,
        sj.service_type,
        sj.start_time,
        sj.service_status AS service_status,
        sj.labor_cost,
        sj.end_time,
        sj.service_details,
        sj.request_id,
        sr.request_status,
        sr.problem_description,
        sr.odometer,
        c.customer_id,
        c.name AS customer_name,
        c.phone AS customer_phone,
        v.vehicle_id,
        v.brand,
        v.model,
        v.plate_number
      FROM "ServiceJob" sj
      LEFT JOIN "ServiceRequest" sr ON sr.request_id = sj.request_id
      LEFT JOIN "Customer" c ON c.customer_id = sr.customer_id
      LEFT JOIN "Vehicle" v ON v.vehicle_id = sr.vehicle_id
      WHERE sj.service_id = $1
      LIMIT 1
    `,
    [serviceId],
  );

  return result.rows[0];
}

export async function createServiceJobRecord(data: CreateServiceJobRecord) {
  const result = await pool.query(
    `
      INSERT INTO "ServiceJob" (
        service_id,
        service_type,
        start_time,
        service_details,
        service_status,
        labor_cost,
        end_time,
        request_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
    [
      data.serviceId,
      data.serviceType ?? 'repair',
      data.startTime ?? null,
      data.serviceDetails ?? null,
      data.serviceStatus ?? null,
      data.laborCost ?? null,
      data.endTime ?? null,
      data.requestId,
    ],
  );

  return result.rows[0];
}

export async function updateServiceJobRecord(serviceId: string, updates: UpdateServiceJobRecord) {
  const columns: UpdateColumn[] = [
    { column: 'service_details', value: updates.serviceDetails },
    { column: 'service_status', value: updates.jobStatus },
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

export async function findServiceJobsByRequestId(requestId: string) {
  const result = await pool.query(
    `
      SELECT
        sj.service_id,
        sj.service_type,
        sj.service_details,
        sj.service_status,
        sj.labor_cost,
        sj.start_time,
        sj.end_time,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'partId',        p.part_id,
            'partName',      p.part_name,
            'quantity',      up.quantity,
            'price',         p.price,
            'stockQuantity', p.stock_quantity
          )) FILTER (WHERE p.part_id IS NOT NULL),
          '[]'
        ) AS parts,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'employeeId',     e.employee_id,
            'name',           e.name,
            'specialization', t.specialization
          )) FILTER (WHERE e.employee_id IS NOT NULL),
          '[]'
        ) AS technicians
      FROM "ServiceJob" sj
      LEFT JOIN "UsePart" up ON up.service_id = sj.service_id
      LEFT JOIN "Part" p ON p.part_id = up.part_id
      LEFT JOIN "AssignTo" at ON at.service_id = sj.service_id
      LEFT JOIN "Technician" t ON t.employee_id = at.technician_id
      LEFT JOIN "Employee" e ON e.employee_id = t.employee_id
      WHERE sj.request_id = $1
      GROUP BY sj.service_id
      ORDER BY sj.service_id
    `,
    [requestId],
  );

  return result.rows;
}

export async function findAssignTo(serviceId: string, technicianId: string) {
  const result = await pool.query(
    `SELECT * FROM "AssignTo" WHERE service_id = $1 AND technician_id = $2 LIMIT 1`,
    [serviceId, technicianId],
  );
  return result.rows[0] ?? null;
}

export async function createAssignTo(serviceId: string, technicianId: string) {
  const result = await pool.query(
    `
      INSERT INTO "AssignTo" (service_id, technician_id)
      VALUES ($1, $2)
      RETURNING *
    `,
    [serviceId, technicianId],
  );
  return result.rows[0];
}

export async function deleteAssignTo(serviceId: string, technicianId: string) {
  const result = await pool.query(
    `
      DELETE FROM "AssignTo"
      WHERE service_id = $1 AND technician_id = $2
      RETURNING *
    `,
    [serviceId, technicianId],
  );
  return result.rows[0] ?? null;
}

export async function replaceUseParts(serviceId: string, parts: Array<{ partId: string; quantity: number }>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`DELETE FROM "UsePart" WHERE service_id = $1`, [serviceId]);

    const inserted = [];
    for (const part of parts) {
      const result = await client.query(
        `INSERT INTO "UsePart" (service_id, part_id, quantity) VALUES ($1, $2, $3) RETURNING *`,
        [serviceId, part.partId, part.quantity],
      );
      inserted.push(result.rows[0]);
    }

    await client.query('COMMIT');
    return inserted;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function replaceAssignments(serviceId: string, technicianIds: string[]) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`DELETE FROM "AssignTo" WHERE service_id = $1`, [serviceId]);

    const inserted = [];
    for (const technicianId of technicianIds) {
      const result = await client.query(
        `INSERT INTO "AssignTo" (service_id, technician_id) VALUES ($1, $2) RETURNING *`,
        [serviceId, technicianId],
      );
      inserted.push(result.rows[0]);
    }

    await client.query('COMMIT');
    return inserted;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteServiceJobCascade(serviceId: string) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`DELETE FROM "AssignTo" WHERE service_id = $1`, [serviceId]);
    await client.query(`DELETE FROM "UsePart" WHERE service_id = $1`, [serviceId]);
    const result = await client.query(
      `DELETE FROM "ServiceJob" WHERE service_id = $1 RETURNING *`,
      [serviceId],
    );

    await client.query('COMMIT');
    return result.rows[0] ?? null;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
