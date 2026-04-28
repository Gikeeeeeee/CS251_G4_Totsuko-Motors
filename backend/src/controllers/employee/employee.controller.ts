import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import {
  getAllEmployees,
  getEmployeeById,
} from '../../services/employee/employee.service';

export const handleGetAllEmployees = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const employees = await getAllEmployees();

    res.json({
      success: true,
      message: 'ดึงข้อมูลพนักงานทั้งหมดสำเร็จ',
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetEmployeeById = async (
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

    const employee = await getEmployeeById(id);

    res.json({
      success: true,
      message: 'ดึงข้อมูลพนักงานสำเร็จ',
      data: employee,
    });
  } catch (error: any) {
    error.statusCode = 404;
    next(error);
  }
};
