// src/services/purchasing/purchase-order.service.ts
import { findPurchasingParts } from '../../repo/parts/purchasing-parts.repo';
import { createPurchaseOrderTransaction } from '../../repo/service/purchase-order.repo';
import { generatePoId } from '../../utils/generateId';

export async function getPartsForOrdering() {
  const parts = await findPurchasingParts();

  return {
    success: true,
    data: parts.map(p => ({
      partId: p.part_id,
      name: p.part_name,
      stockQuantity: p.stock_qty,
      price: p.price || 0,
      status: p.status,
    }))
  };
}

export async function createNewPurchaseOrder(staffId: string, payload: any) {
  const { supplierId, items } = payload;

  if (!items || items.length === 0) {
    throw new Error('ต้องมีอย่างน้อย 1 รายการในใบสั่งซื้อ');
  }

  const poData = {
    poId: await generatePoId(),
    orderStatus: 'Pending',
    orderDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD for date column
    purchasingStaffId: staffId,
    supplierId: supplierId,
    orderQuantity: items.reduce((acc: number, item: any) => acc + Number(item.quantity), 0),
  };

  const result = await createPurchaseOrderTransaction(poData, items);

  return {
    success: true,
    message: 'บันทึกใบสั่งซื้อสำเร็จ',
    data: result
  };
}