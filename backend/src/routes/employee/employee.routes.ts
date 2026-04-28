import { Router } from 'express';
import {
  handleGetAllEmployees,
  handleGetEmployeeById,
} from '../../controllers/employee/employee.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// GET /api/employees - ดึงพนักงานทั้งหมด
router.get('/', authMiddleware, handleGetAllEmployees);

// GET /api/employees/:id - ดึงพนักงานตาม ID
router.get('/:id', authMiddleware, handleGetEmployeeById);

export default router;
