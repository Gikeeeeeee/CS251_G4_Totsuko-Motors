import { findPurchasingParts } from '../../repo/parts/purchasing-parts.repo';
import { 
  createPurchaseOrderTransaction,
  findPurchaseOrdersRepo,
  findPurchaseOrderPartsRepo,
  findEmployeeIdByUserIdRepo,
  updatePurchaseOrderStatusTransaction,
  findSuppliersRepo,

} from '../../repo/service/purchase-order.repo';
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
    orderDate: new Date().toISOString().split('T')[0],
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

// ============================================================================
// 🚀 [ของใหม่] GET ซ้าย, GET ขวา, PATCH สถานะ
// ============================================================================

export async function getSuppliersService() {
  return await findSuppliersRepo();
}

export async function getPurchaseOrdersService() {
  return await findPurchaseOrdersRepo();
}

export async function getPurchaseOrderPartsService(poId: string) {
  return await findPurchaseOrderPartsRepo(poId);
}

export async function updateOrderStatusService(poId: string, userId: string, newStatus: string) {
  // 1. หา employeeId จาก userId
  const employeeId = await findEmployeeIdByUserIdRepo(userId);
  
  if (!employeeId) {
    throw new Error('NOT_FOUND_EMPLOYEE');
  }

  // 2. สั่งอัปเดตสถานะและบันทึกรหัสพนักงาน
  const updatedOrder = await updatePurchaseOrderStatusTransaction(poId, employeeId, newStatus);

  if (!updatedOrder) {
    throw new Error('NOT_FOUND_ORDER');
  }

  return updatedOrder;
}