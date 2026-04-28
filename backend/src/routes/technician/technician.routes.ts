import { Router } from 'express';
import {
  handleGetAvailableTechnicians,
  handleGetAllTechnicians,
  handleGetTechnicianById,
} from '../../controllers/technician/technician.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// GET /api/technicians/available - ดึงช่างที่ว่าง
router.get('/available', authMiddleware, handleGetAvailableTechnicians);

// GET /api/technicians - ดึงช่างทั้งหมด
router.get('/', authMiddleware, handleGetAllTechnicians);

// GET /api/technicians/:id - ดึงช่างตาม ID
router.get('/:id', authMiddleware, handleGetTechnicianById);

export default router;
