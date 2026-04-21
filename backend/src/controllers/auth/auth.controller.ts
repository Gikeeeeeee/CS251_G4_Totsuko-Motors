import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { loginUser, registerUser, refreshAccessToken } from '../../services/auth/auth.service';
import { generateToken, generateRefreshToken } from '../../utils/jwt';

export const login = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error: any = new Error('กรุณากรอก email และ password');
      error.statusCode = 400;
      return next(error);
    }

    const user = await loginUser(email, password);
    const token = generateToken(user.userId);
    const refreshToken = generateRefreshToken(user.userId);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000, 
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      message: 'Login สำเร็จ',
      user,
    });
  } catch (error: any) {
    error.statusCode = 401;
    next(error);
  }
};

export const logout = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logout สำเร็จ' });
  } catch (error) {
    next(error);
  }
};

export const verify = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({
      success: true,
      message: 'Token ถูกต้อง',
      userId: req.userId,
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, username, password, userId } = req.body;

    if (!email || !username || !password || !userId) {
      const error: any = new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
      error.statusCode = 400;
      return next(error);
    }

    const user = await registerUser(email, username, password, userId);
    const token = generateToken(user.userId);
    const refreshToken = generateRefreshToken(user.userId);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'สมัครสมาชิกสำเร็จ',
      user,
    });
  } catch (error: any) {
    error.statusCode = 400;
    next(error);
  }
};

export const refresh = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      const error: any = new Error('ไม่พบ refresh token');
      error.statusCode = 401;
      return next(error);
    }

    const result = await refreshAccessToken(refreshToken);
    
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000, 
    });

    res.json({
      success: true,
      message: 'Refresh token สำเร็จ',
      userId: result.userId,
    });
  } catch (error: any) {
    error.statusCode = 401;
    next(error);
  }
};
