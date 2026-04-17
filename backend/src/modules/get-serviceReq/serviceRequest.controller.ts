import { Request, Response } from 'express';
import { getIntakeRequestsService } from './serviceRequest.service';

export const getIntakeRequests = async (req: Request, res: Response) => {
  try {
    // ดึงค่า page และ limit จาก Query String
    // หากไม่มีการส่งค่ามา จะใช้ค่าเริ่มต้นคือหน้า 1 และแสดง 10 รายการ
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // ส่งค่าพารามิเตอร์ไปให้ Service ทำหน้าที่ดึงข้อมูลจากฐานข้อมูล
    const result = await getIntakeRequestsService(page, limit);

    // จัดรูปแบบ JSON Response เพื่อส่งกลับไปยัง Frontend
    res.json({
      success: true,
      data: result.data,
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        hasNextPage: page < result.totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    // ดักจับและจัดการข้อผิดพลาดเพื่อไม่ให้เซิร์ฟเวอร์หยุดทำงาน
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};