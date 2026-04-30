<<<<<<< HEAD
import { hashPassword, comparePassword } from '../../utils/password';
import { generateToken, verifyRefreshToken } from '../../utils/jwt';
import {
  createUser,
  findExistingUser,
  findUserByEmail,
  findUserByUserId,
} from '../../repo/auth/auth.repo';

export const loginUser = async (email: string, password: string) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  return {
    userId: user.userId,
    email: user.email,
    username: user.username,
    role: user.role,
=======
import { db } from '../../db';
import { userAccount, employee, technician, clerk, purchasingStaff } from '../../db/schema';
import { eq, or } from 'drizzle-orm';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateToken, verifyRefreshToken } from '../../utils/jwt';
import { generateEmployeeId, generateUserId } from '../../utils/generateId';

export const loginUser = async (emailOrUsername: string, password: string) => {

  const user = await db.select({
    userId: userAccount.userId,
    name: userAccount.name,
    email: userAccount.email,
    username: userAccount.username,
    password: userAccount.password,
    role: userAccount.role,
    employeeId: employee.employeeId,
    phone: employee.phone,
    hireDate: employee.hireDate,
  }).from(userAccount)
  .leftJoin(employee, eq(userAccount.userId, employee.userId))
  .where(
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
    role: user[0].role,
    hireDate: user[0].hireDate,
>>>>>>> merge/sprint2/be
  };
};

export const registerUser = async (
<<<<<<< HEAD
  email: string,
  username: string,
  password: string,
  userId: string,
) => {
  const existingUser = await findExistingUser(email, username, userId);

  if (existingUser) {
    if (existingUser.email === email) {
      throw new Error('Email already exists');
    }
    if (existingUser.username === username) {
      throw new Error('Username already exists');
    }
    if (existingUser.userId === userId) {
      throw new Error('User ID already exists');
    }
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await createUser({
    userId,
    email,
    username,
    password: hashedPassword,
  });

  return {
    userId: newUser.userId,
    email: newUser.email,
    username: newUser.username,
    role: newUser.role,
=======
  email: string, 
  username: string, 
  password: string, 
  role: 'technician' | 'clerk' | 'purchasingStaff',
  name: string,
  phone?: string,
  hireDate?: string
) => {

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


  const userId = generateUserId();
  const employeeId = await generateEmployeeId(role);

  const hashedPassword = await hashPassword(password);
  
  const finalHireDate = hireDate ? new Date(hireDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

  // Insert into userAccount
  await db.insert(userAccount).values({
    userId,
    name,
    email,
    username,
    password: hashedPassword,
    role,
    status: 'Active',
  });

  // Insert into employee
  await db.insert(employee).values({
    employeeId,
    name,
    phone,
    hireDate: finalHireDate,
    userId,
  });

  // Insert into role-specific table
  if (role === 'technician') {
    await db.insert(technician).values({
      employeeId,
    });
  } else if (role === 'clerk') {
    await db.insert(clerk).values({
      employeeId,
    });
  } else if (role === 'purchasingStaff') {
    await db.insert(purchasingStaff).values({
      employeeId,
    });
  }

  return {
    userId,
    employeeId,
    name,
    email,
    username,
    phone,
    role,
    hireDate: finalHireDate,
>>>>>>> merge/sprint2/be
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded) {
<<<<<<< HEAD
    throw new Error('Invalid or expired refresh token');
  }

  const user = await findUserByUserId(decoded.userId);

  if (!user) {
    throw new Error('User not found');
=======
    throw new Error('Refresh token ไม่ถูกต้องหรือหมดอายุ');
  }

  const user = await db.select().from(userAccount).where(eq(userAccount.userId, decoded.userId)).limit(1);

  if (user.length === 0) {
    throw new Error('ไม่พบผู้ใช้งาน');
>>>>>>> merge/sprint2/be
  }

  const newToken = generateToken(decoded.userId);

  return {
    token: newToken,
    userId: decoded.userId,
  };
};
