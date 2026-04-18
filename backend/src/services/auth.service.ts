import { db } from '../db';
import { userAccount } from '../db/schema';
import { eq, or } from 'drizzle-orm';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken, verifyRefreshToken } from '../utils/jwt';

export const loginUser = async (email: string, password: string) => {
  const user = await db.select().from(userAccount).where(eq(userAccount.email, email)).limit(1);

  if (user.length === 0) {
    throw new Error('ไม่พบผู้ใช้งาน');
  }

  const isPasswordValid = await comparePassword(password, user[0].password);

  if (!isPasswordValid) {
    throw new Error('รหัสผ่านไม่ถูกต้อง');
  }

  return {
    userId: user[0].userId,
    email: user[0].email,
    username: user[0].username,
    role: user[0].role,
  };
};

export const registerUser = async (email: string, username: string, password: string, userId: string) => {
  // ตรวจสอบว่ามีผู้ใช้งานนี้อยู่แล้วหรือไม่
  const existingUser = await db.select().from(userAccount).where(
    or(
      eq(userAccount.email, email),
      eq(userAccount.username, username),
      eq(userAccount.userId, userId)
    )
  ).limit(1);

  if (existingUser.length > 0) {
    if (existingUser[0].email === email) {
      throw new Error('อีเมลนี้ถูกใช้งานแล้ว');
    }
    if (existingUser[0].username === username) {
      throw new Error('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว');
    }
    if (existingUser[0].userId === userId) {
      throw new Error('รหัสผู้ใช้นี้ถูกใช้งานแล้ว');
    }
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await db.insert(userAccount).values({
    userId,
    email,
    username,
    password: hashedPassword,
    role: 'user',
    status: 'Active',
  }).returning();

  return {
    userId: newUser[0].userId,
    email: newUser[0].email,
    username: newUser[0].username,
    role: newUser[0].role,
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
