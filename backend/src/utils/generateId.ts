import { db } from '../db';
import { userAccount, employee, purchaseOrder} from '../db/schema';
import { sql, eq, like, desc } from 'drizzle-orm';

/**
 * สร้าง employeeId ตามรูปแบบ:
 * - Technician: T001, T002, T003, ...
 * - Clerk: C001, C002, C003, ...
 * - PurchasingStaff: P001, P002, P003, ...
 */
export const generateEmployeeId = async (role: 'technician' | 'clerk' | 'purchasingStaff'): Promise<string> => {
  // กำหนด prefix ตาม role
  const prefixMap = {
    technician: 'T',
    clerk: 'C',
    purchasingStaff: 'P',
  };

  const prefix = prefixMap[role];

  // หา employeeId ล่าสุดที่มี prefix นี้
  // Note: Since role is in userAccount, we need to join
  const result = await db
    .select({ employeeId: employee.employeeId })
    .from(employee)
    .innerJoin(userAccount, eq(employee.userId, userAccount.userId))
    .where(sql`${userAccount.role} = ${role}`)
    .orderBy(sql`${employee.employeeId} DESC`)
    .limit(1);

  let nextNumber = 1;

  if (result.length > 0) {
    // ดึงตัวเลขจาก employeeId เช่น T001 -> 001 -> 1
    const lastId = result[0].employeeId;
    const lastNumber = parseInt(lastId.substring(1));
    nextNumber = lastNumber + 1;
  }

  // สร้าง employeeId ใหม่ เช่น T001, T002
  const employeeId = `${prefix}${nextNumber.toString().padStart(3, '0')}`;

  return employeeId;
};

/**
 * สร้าง userId แบบสุ่ม (10 ตัวอักษร)
 * รูปแบบ: U + 9 หลักสุ่ม เช่น U123456789
 */
export const generateUserId = (): string => {
  const prefix = 'U';
  const randomNumber = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  return `${prefix}${randomNumber}`;
};

export const generatePoId = async (): Promise<string> => {
  const prefix = 'PO';
  const currentYear = new Date().getFullYear(); // เช่น 2026
  const searchPattern = `${prefix}-${currentYear}-%`;

  // หา poId ล่าสุดของปีปัจจุบัน
  const result = await db
    .select({ poId: purchaseOrder.poId })
    .from(purchaseOrder)
    .where(like(purchaseOrder.poId, searchPattern))
    .orderBy(desc(purchaseOrder.poId))
    .limit(1);

  let nextNumber = 1;

  if (result.length > 0) {
    // ดึงตัวเลข 4 หลักสุดท้ายออกมา เช่น PO-2026-0005 -> 0005 -> 5
    const lastId = result[0].poId;
    const lastNumberStr = lastId.split('-')[2]; // แยกเอาส่วนท้ายสุด
    const lastNumber = parseInt(lastNumberStr);
    nextNumber = lastNumber + 1;
  }

  // สร้าง ID ใหม่: PO + ปี + เลขรัน 4 หลัก (0001, 0002, ...)
  const newPoId = `${prefix}-${currentYear}-${nextNumber.toString().padStart(4, '0')}`;

  return newPoId;
};
