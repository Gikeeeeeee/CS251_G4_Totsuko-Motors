import { db } from '../../db';
import { serviceRequest } from '../../db/schema';
import { eq, count, desc } from 'drizzle-orm';

export const getIntakeRequestsService = async (page: number, limit: number) => {
  // คำนวณจุดเริ่มต้นของการดึงข้อมูลตามหน้าและจำนวนที่กำหนด
  const offset = (page - 1) * limit;

  // คิวรีที่ 1: ดึงข้อมูลรายการซ่อมที่มีสถานะเป็น INTAKE 
  // เรียงลำดับจากวันที่ล่าสุด และจำกัดจำนวนตาม Pagination
  const data = await db.select()
    .from(serviceRequest)
    .where(eq(serviceRequest.requestStatus, 'INTAKE'))
    .orderBy(desc(serviceRequest.checkingDate))
    .limit(limit)
    .offset(offset);

  // คิวรีที่ 2: นับจำนวนรายการซ่อมทั้งหมดที่มีสถานะ INTAKE
  // เพื่อนำไปใช้คำนวณจำนวนหน้าทั้งหมด
  const totalRes = await db.select({ value: count() })
    .from(serviceRequest)
    .where(eq(serviceRequest.requestStatus, 'INTAKE'));

  const totalItems = totalRes[0].value;
  const totalPages = Math.ceil(totalItems / limit);

  // คืนค่าข้อมูลดิบกลับไปให้ Controller นำไปจัดรูปแบบต่อ
  return {
    data,
    totalItems,
    totalPages
  };
};