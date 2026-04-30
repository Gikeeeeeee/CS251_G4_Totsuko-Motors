import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import {
  getAvailableTechnicians,
  getAllTechnicians,
  getTechnicianById,
} from '../../services/technician/technician.service';

export const handleGetAvailableTechnicians = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const technicians = await getAvailableTechnicians();

    res.json({
      success: true,
      message: 'ดึงข้อมูลช่างที่ว่างสำเร็จ',
      data: technicians,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetAllTechnicians = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const technicians = await getAllTechnicians();

    res.json({
      success: true,
      message: 'ดึงข้อมูลช่างทั้งหมดสำเร็จ',
      data: technicians,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetTechnicianById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      const error: any = new Error('กรุณาระบุ employee ID');
      error.statusCode = 400;
      return next(error);
    }

    const technician = await getTechnicianById(id);

    res.json({
      success: true,
      message: 'ดึงข้อมูลช่างสำเร็จ',
      data: technician,
    });
  } catch (error: any) {
    error.statusCode = 404;
    next(error);
  }
};
