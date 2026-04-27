// src/repo/purchasing/purchase-order.repo.ts
import { db } from '../../db';
import { purchaseOrder, purchaseOrderPart, supplier, part, userAccount, employee } from '../../db/schema';
import { eq, sql } from 'drizzle-orm';

export async function createPurchaseOrderTransaction(poData: any, items: any[]) {
  return await db.transaction(async (tx) => {
    // 1. บันทึกหัวกระดาษใบสั่งซื้อ
    const [insertedPo] = await tx
      .insert(purchaseOrder)
      .values({
        poId: poData.poId,
        orderStatus: poData.orderStatus,
        orderDate: poData.orderDate,
        purchasingStaffId: poData.purchasingStaffId,
        supplierId: poData.supplierId,
        orderQuantity: poData.orderQuantity, 
      })
      .returning();

    // 2. เตรียมข้อมูลรายการอะไหล่ (เติม quantity เข้ามาแล้ว!)
    const itemsToInsert = items.map((item) => ({
      poId: insertedPo.poId,
      partId: item.partId,
      buyingPrice: item.unitCost.toString(), 
      quantity: item.quantity, // ✅ แก้บั๊กที่ช่องนี้ว่างแล้วครับ
    }));

    // 3. บันทึกรายการอะไหล่
    const insertedItems = await tx
      .insert(purchaseOrderPart)
      .values(itemsToInsert)
      .returning();

    return { purchaseOrder: insertedPo, items: insertedItems };
  });
}

// ============================================================================
// [GET] /PurchaseOrders - ดึงรายการฝั่งซ้าย (Join Supplier)
// ============================================================================
export const findPurchaseOrdersRepo = async () => {
  return await db
    .select({
      poId: purchaseOrder.poId,
      orderStatus: purchaseOrder.orderStatus,
      orderDate: purchaseOrder.orderDate,
      orderQuantity: purchaseOrder.orderQuantity,
      supplierName: supplier.supplierName,
    })
    .from(purchaseOrder)
    .leftJoin(supplier, eq(purchaseOrder.supplierId, supplier.supplierId))
    .orderBy(purchaseOrder.orderDate);
};

// ============================================================================
// [GET] /PurchaseOrderParts/{po_id} - ดึงรายการฝั่งขวา (Join Part)
// ============================================================================
export const findPurchaseOrderPartsRepo = async (poId: string) => {
  return await db
    .select({
      poId: purchaseOrderPart.poId,
      partId: purchaseOrderPart.partId,
      partName: part.partName,
      buyingPrice: purchaseOrderPart.buyingPrice,
      quantity: purchaseOrderPart.quantity, // Ensure 'quantity' exists in your schema or adjust accordingly
    })
    .from(purchaseOrderPart)
    .leftJoin(part, eq(purchaseOrderPart.partId, part.partId))
    .where(eq(purchaseOrderPart.poId, poId));
};

// ============================================================================
// [PATCH] /PurchaseOrders/{id} - อัปเดตสถานะและคนทำรายการ
// ============================================================================

// 1. ฟังก์ชันช่วยหา Employee ID จาก User ID
export const findEmployeeIdByUserIdRepo = async (userId: string) => {
  const result = await db
    .select({ employeeId: employee.employeeId }) // ดึงรหัสพนักงาน
    .from(employee) // จากตาราง employee
    .where(eq(employee.userId, userId)) // โดยเทียบกับ userId ที่ล็อกอินเข้ามา
    .limit(1);
  
  return result[0]?.employeeId;
};
// 2. ฟังก์ชันอัปเดตสถานะ
export const updatePurchaseOrderStatusTransaction = async (poId: string, employeeId: string, status: string) => {
  return await db.transaction(async (tx) => {
    // 1. อัปเดตสถานะใบสั่งซื้อ (รับค่า status แบบไดนามิก ไม่ได้ฮาร์ดโค้ดแค่ Paid แล้ว)
    const [updatedOrder] = await tx
      .update(purchaseOrder)
      .set({
        orderStatus: status,
        purchasingStaffId: employeeId,
      })
      .where(eq(purchaseOrder.poId, poId))
      .returning();

    if (!updatedOrder) return null;

    // 2. ถ้าสถานะเป็น 'Paid' ให้ดึงรายการอะไหล่ไปบวกเพิ่มในสต๊อก
    if (status === 'Paid') {
      const items = await tx
        .select()
        .from(purchaseOrderPart)
        .where(eq(purchaseOrderPart.poId, poId));

      for (const item of items) {
        // ใช้ sql เพื่อสั่ง + เลขจากจำนวนเดิมในฐานข้อมูล
        await tx
          .update(part)
          .set({ stockQuantity: sql`${part.stockQuantity} + ${item.quantity}` })
          .where(eq(part.partId, item.partId!));
      }
    }

    return updatedOrder;
  });
};

export const findSuppliersRepo = async () => {
  return await db
    .select({
      supplierId: supplier.supplierId,
      supplierName: supplier.supplierName,
    })
    .from(supplier);
};