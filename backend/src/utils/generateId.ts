import { db } from '../db';
import { userAccount } from '../db/schema';
import { sql } from 'drizzle-orm';

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
  const result = await db
    .select({ employeeId: userAccount.employeeId })
    .from(userAccount)
    .where(sql`${userAccount.role} = ${role}`)
    .orderBy(sql`${userAccount.employeeId} DESC`)
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
