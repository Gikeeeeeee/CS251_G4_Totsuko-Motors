import { Request, Response, NextFunction } from 'express';
import { verifyToken, verifyRefreshToken, generateToken } from '../utils/jwt';
import { db } from '../db';
import { userAccount } from '../db/schema';
import { eq } from 'drizzle-orm';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    const refreshToken = req.cookies.refreshToken;

    // ถ้าไม่มี access token แต่มี refresh token
    if (!token && refreshToken) {
      const decoded = verifyRefreshToken(refreshToken);

      if (decoded) {
        // สร้าง access token ใหม่
        const newToken = generateToken(decoded.userId);
        
        res.cookie('token', newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 15 * 60 * 1000, // 15 minutes
        });

        req.userId = decoded.userId;
        return next();
      }
    }

    // ถ้าไม่มี token เลย
    if (!token) {
      const error: any = new Error('ไม่พบ token กรุณา login ก่อน');
      error.statusCode = 401;
      return next(error);
    }

    // ตรวจสอบ access token
    const decoded = verifyToken(token);

    if (!decoded) {
      const error: any = new Error('Token ไม่ถูกต้องหรือหมดอายุ');
      error.statusCode = 401;
      return next(error);
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware สำหรับตรวจสอบ role
export const requireRole = (...allowedRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        const error: any = new Error('ไม่พบข้อมูลผู้ใช้');
        error.statusCode = 401;
        return next(error);
      }

      // ดึงข้อมูล user จาก database
      const user = await db.select().from(userAccount).where(eq(userAccount.userId, req.userId)).limit(1);

      if (user.length === 0) {
        const error: any = new Error('ไม่พบผู้ใช้งาน');
        error.statusCode = 404;
        return next(error);
      }

      const userRole = user[0].role;
      req.userRole = userRole;

      // ตรวจสอบว่า role ของ user อยู่ใน allowedRoles หรือไม่
      if (!allowedRoles.includes(userRole || '')) {
        const error: any = new Error('คุณไม่มีสิทธิ์เข้าถึงส่วนนี้');
        error.statusCode = 403;
        return next(error);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware สำหรับแต่ละ role
export const isTechnician = requireRole('technician');
export const isClerk = requireRole('clerk');
export const isPurchasingStaff = requireRole('purchasingStaff');

// Middleware สำหรับหลาย role
export const isClerkOrPurchasing = requireRole('clerk', 'purchasingStaff');
export const isAnyStaff = requireRole('technician', 'clerk', 'purchasingStaff');
