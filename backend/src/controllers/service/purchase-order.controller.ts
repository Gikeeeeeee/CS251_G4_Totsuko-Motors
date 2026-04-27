import { Request, Response, NextFunction } from 'express';
import { 
  getPartsForOrdering, 
  createNewPurchaseOrder,
  getPurchaseOrdersService,
  getPurchaseOrderPartsService,
  updateOrderStatusService,
  getSuppliersService
} from '../../services/service/purchase-order.service'; // ปรับ Path ให้ตรงด้วยนะครับ

// กำหนด Interface สำหรับ AuthRequest
export interface AuthRequest extends Request {
  userId?: string;
}

export const getSuppliers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getSuppliersService();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAvailableParts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getPartsForOrdering();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const postPurchaseOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // สมมติว่า staffId ดึงมาจาก req.userId หรือ req.body ชั่วคราว (ตามที่คุณใช้งานอยู่)
    const staffId = req.userId || null; 
    const payload = req.body;
    const result = await createNewPurchaseOrder(staffId as any, payload);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 🚀 [ของใหม่]
// ============================================================================
export const getPurchaseOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getPurchaseOrdersService();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getPurchaseOrderParts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { po_id } = req.params;
    const data = await getPurchaseOrderPartsService(po_id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: ไม่พบข้อมูลผู้ใช้ในระบบ' });
    }

    if (!status) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุสถานะ (status: Paid หรือ Cancelled)' });
    }

    const updatedData = await updateOrderStatusService(id, userId, status);
    res.json({ success: true, message: `อัปเดตสถานะเป็น ${status} สำเร็จ`, data: updatedData });

  } catch (error: any) {
    if (error.message === 'INVALID_STATUS') {
      return res.status(400).json({ success: false, message: 'สถานะไม่ถูกต้อง (รับเฉพาะ Paid หรือ Cancelled)' });
    }
    if (error.message === 'NOT_FOUND_EMPLOYEE') {
      return res.status(404).json({ success: false, message: 'ไม่พบรหัสพนักงานที่ผูกกับบัญชีนี้' });
    }
    if (error.message === 'NOT_FOUND_ORDER') {
      return res.status(404).json({ success: false, message: 'ไม่พบใบสั่งซื้อที่ระบุ' });
    }
    next(error);
  }
};