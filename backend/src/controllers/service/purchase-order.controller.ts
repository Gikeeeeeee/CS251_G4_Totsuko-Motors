// src/controllers/purchasing/purchase-order.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as poService from '../../services/service/purchase-order.service';


export async function getAvailableParts(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await poService.getPartsForOrdering();
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

// บันทึกใบสั่งซื้อ
export async function postPurchaseOrder(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. ดึง staffId จาก Token (ที่ผ่าน Middleware มาแล้ว)
    const staffId = (req as any).employeeId; 

    // 2. ดึงข้อมูลอื่นจาก Body
    // หมายเหตุ: ไม่ต้องดึง employeeId จาก body แล้วเพราะเราใช้จาก staffId (Token)
    const { poId, supplierId, orderQuantity, items } = req.body; 

    // 3. ส่งข้อมูลไปที่ Service
    const result = await poService.createNewPurchaseOrder(staffId, {
      poId,
      supplierId,
      orderQuantity,
      items
    });

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}