import { sql } from 'drizzle-orm';
import { db } from '../../db';

export type PurchasingPartStatus =
  | 'Inventory'
  | 'Nearly Out of Stock'
  | 'Waiting for delivery';

export type PurchasingPartRow = {
  part_id: string;
  part_name: string;
  stock_qty: number;
  price: string | null;
  reorder_point: number;
  reserved_qty: number;
  status: PurchasingPartStatus;
};

export async function findPurchasingParts(status?: PurchasingPartStatus) {
  const result = await db.execute<PurchasingPartRow>(sql`
    WITH part_statuses AS (
      SELECT
        p."part_id",
        p."part_name",
        COALESCE(p."stock_quantity", 0) AS "stock_qty",
        p."price",
        COALESCE(p."reorder_point", 0) AS "reorder_point",
        COALESCE(p."reserved_qty", 0) AS "reserved_qty",
        CASE
          WHEN COALESCE(p."stock_quantity", 0) - COALESCE(p."reserved_qty", 0) > COALESCE(p."reorder_point", 0)
            THEN 'Inventory'
          WHEN EXISTS (
            SELECT 1
            FROM "PurchaseOrderPart" pop
            INNER JOIN "PurchaseOrder" po ON po."po_id" = pop."po_id"
            WHERE pop."part_id" = p."part_id"
              AND LOWER(COALESCE(po."order_status", '')) NOT IN (
                'delivered',
                'received',
                'completed',
                'cancelled',
                'canceled'
              )
          )
            THEN 'Waiting for delivery'
          ELSE 'Nearly Out of Stock'
        END AS "status"
      FROM "Part" p
    )
    SELECT
      "part_id",
      "part_name",
      "stock_qty",
      "price",
      "reorder_point",
      "reserved_qty",
      "status"
    FROM part_statuses
    WHERE ${status ? sql`"status" = ${status}` : sql`TRUE`}
    ORDER BY "part_id";
  `);

  return result.rows;
}
