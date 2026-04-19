import { Request, Response, NextFunction } from 'express';
import { verifyToken, verifyRefreshToken, generateToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  userId?: string;
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
