import { db } from '../db';
import { userAccount } from '../db/schema';
import { eq, or } from 'drizzle-orm';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken, verifyRefreshToken } from '../utils/jwt';
import { generateEmployeeId, generateUserId } from '../utils/generateId';

export const loginUser = async (emailOrUsername: string, password: string) => {
  // ค้นหาผู้ใช้ด้วย email หรือ username
  const user = await db.select().from(userAccount).where(
    or(
      eq(userAccount.email, emailOrUsername),
      eq(userAccount.username, emailOrUsername)
    )
  ).limit(1);

  if (user.length === 0) {
    throw new Error('ไม่พบผู้ใช้งาน');
  }

  const isPasswordValid = await comparePassword(password, user[0].password);

  if (!isPasswordValid) {
    throw new Error('รหัสผ่านไม่ถูกต้อง');
  }

  return {
    userId: user[0].userId,
    employeeId: user[0].employeeId,
    name: user[0].name,
    email: user[0].email,
    username: user[0].username,
    phone: user[0].phone,
    address: user[0].address,
    role: user[0].role,
    hireDate: user[0].hireDate,
  };
};

export const registerUser = async (
  email: string, 
  username: string, 
  password: string, 
  role: 'technician' | 'clerk' | 'purchasingStaff',
  name: string,
  phone?: string[],
  address?: string,
  hireDate?: string
) => {
  // ตรวจสอบว่ามีผู้ใช้งานนี้อยู่แล้วหรือไม่
  const existingUser = await db.select().from(userAccount).where(
    or(
      eq(userAccount.email, email),
      eq(userAccount.username, username)
    )
  ).limit(1);

  if (existingUser.length > 0) {
    if (existingUser[0].email === email) {
      throw new Error('อีเมลนี้ถูกใช้งานแล้ว');
    }
    if (existingUser[0].username === username) {
      throw new Error('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว');
    }
  }

  // สร้าง userId และ employeeId อัตโนมัติ
  const userId = generateUserId();
  const employeeId = await generateEmployeeId(role);

  const hashedPassword = await hashPassword(password);
  
  const finalHireDate = hireDate || new Date().toISOString().split('T')[0];

  const newUser = await db.insert(userAccount).values({
    userId,
    employeeId,
    name,
    email,
    username,
    password: hashedPassword,
    phone,
    address,
    role,
    status: 'Active',
    hireDate: finalHireDate,
  }).returning();

  return {
    userId: newUser[0].userId,
    employeeId: newUser[0].employeeId,
    name: newUser[0].name,
    email: newUser[0].email,
    username: newUser[0].username,
    phone: newUser[0].phone,
    address: newUser[0].address,
    role: newUser[0].role,
    hireDate: newUser[0].hireDate,
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded) {
    throw new Error('Refresh token ไม่ถูกต้องหรือหมดอายุ');
  }

  const user = await db.select().from(userAccount).where(eq(userAccount.userId, decoded.userId)).limit(1);

  if (user.length === 0) {
    throw new Error('ไม่พบผู้ใช้งาน');
  }

  const newToken = generateToken(decoded.userId);

  return {
    token: newToken,
    userId: decoded.userId,
  };
};
