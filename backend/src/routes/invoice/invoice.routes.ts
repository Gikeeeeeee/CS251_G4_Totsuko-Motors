import { Router } from 'express';
import {
  getInvoiceByRequestIdController,
  createInvoiceController,
} from '../../controllers/invoice/invoice.controller';

const router = Router();

// GET /api/invoices/request/:requestId  → ดึง Invoice ตาม requestId
router.get('/request/:requestId', getInvoiceByRequestIdController);

// POST /api/invoices  → สร้าง Invoice ใหม่
router.post('/', createInvoiceController);

export default router;
