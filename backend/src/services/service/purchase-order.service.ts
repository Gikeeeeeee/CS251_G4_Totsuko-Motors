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
import { db } from '../../db';
import { part } from '../../db/schema';
import { inArray } from 'drizzle-orm';

export async function getPartsForOrdering() {
  const parts = await findPurchasingParts();

  // ดึง supplierId จากตาราง Part โดยตรง เพื่อแก้ปัญหา Repo ไม่ได้ select ค่านี้มาให้
  const partIds = parts.map((p: any) => p.part_id || p.partId).filter(Boolean);
  const extraInfo: Record<string, string | null> = {};
  
  if (partIds.length > 0) {
    const dbParts = await db
      .select({ partId: part.partId, supplierId: part.supplierId })
      .from(part)
      .where(inArray(part.partId, partIds));
    
    dbParts.forEach(dp => {
      extraInfo[dp.partId] = dp.supplierId;
    });
  }

  return {
    success: true,
    data: parts.map((p: any) => {
      const pId = p.part_id || p.partId;
      return {
        partId: pId,
        name: p.part_name || p.partName || p.name,
        stockQuantity: p.stock_qty || p.stockQuantity,
        price: p.price || 0,
      status: p.status,
        supplierId: p.supplierId || p.supplier_id || extraInfo[pId] || null,
      };
    })
  };
}

export async function createNewPurchaseOrder(staffId: string, payload: any) {
  const { supplierId, items } = payload;

  if (!items || items.length === 0) {
    throw new Error('ต้องมีอย่างน้อย 1 รายการในใบสั่งซื้อ');
  }

  // 🛠️ จุดแก้ปัญหา: แกะกล่อง JSON เพื่อเอาแค่ employeeId
  let cleanStaffId = staffId;
  if (typeof cleanStaffId === 'string' && cleanStaffId.trim().startsWith('{')) {
    try {
      const parsedData = JSON.parse(cleanStaffId);
      // ดึง employeeId ถ้าไม่มีให้ดึง userId ถ้าไม่มีอีกให้ใช้ EMP001
      cleanStaffId = parsedData.employeeId || parsedData.userId || 'EMP001'; 
    } catch (e) {
      console.error("Parse JSON staffId failed", e);
      cleanStaffId = 'EMP001'; // Fallback ป้องกันระบบล่ม
    }
  } else if (!cleanStaffId) {
    cleanStaffId = 'EMP001';
  }

  const poData = {
    poId: await generatePoId(),
    orderStatus: 'Pending',
    orderDate: new Date().toISOString().split('T')[0],
    purchasingStaffId: cleanStaffId, // 👈 ใช้ ID ที่คลีนแล้ว
    supplierId: supplierId,
    orderQuantity: items.reduce((acc: number, item: any) => acc + Number(item.quantity), 0),
  };

  console.log("DEBUG PO DATA:", poData);
  console.log("DEBUG ITEMS:", items);
  
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