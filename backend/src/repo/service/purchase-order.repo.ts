// src/repo/purchasing/purchase-order.repo.ts
import { db } from '../../db';
import { purchaseOrder, purchaseOrderPart } from '../../db/schema';
import { eq } from 'drizzle-orm';

export async function createPurchaseOrderTransaction(poData: any, items: any[]) {
  return await db.transaction(async (tx) => {
    // 1. บันทึกหัวกระดาษใบสั่งซื้อ (ตาราง PurchaseOrder)
    const [insertedPo] = await tx
      .insert(purchaseOrder)
      .values({
        poId: poData.poId,
        orderStatus: poData.orderStatus,
        orderDate: poData.orderDate,
        purchasingStaffId: poData.purchasingStaffId,
        supplierId: poData.supplierId,
        orderQuantity: poData.orderQuantity, // จำนวนรายการทั้งหมด หรือ total ชิ้น
      })
      .returning();

    // 2. เตรียมข้อมูลรายการอะไหล่ (ตาราง PurchaseOrderPart)
    const itemsToInsert = items.map((item) => ({
      poId: insertedPo.poId,
      partId: item.partId,
      buyingPrice: item.unitCost.toString(), // ใน Schema เป็น decimal ต้องส่งเป็น string หรือหมุนให้ตรง
    }));

    // 3. บันทึกรายการอะไหล่ (ตาราง PurchaseOrderPart)
    const insertedItems = await tx
      .insert(purchaseOrderPart)
      .values(itemsToInsert)
      .returning();

    return { purchaseOrder: insertedPo, items: insertedItems };
  });
}