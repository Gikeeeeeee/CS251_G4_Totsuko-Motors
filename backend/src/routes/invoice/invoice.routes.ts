import { Router } from 'express';
import {
  getInvoiceByRequestIdController,
  createInvoiceController,
  getAllInvoicesController,
  payInvoiceController,
} from '../../controllers/invoice/invoice.controller';

const router = Router();

// GET /api/invoices  → ดึง Invoice ทั้งหมด
router.get('/', getAllInvoicesController);

// GET /api/invoices/request/:requestId  → ดึง Invoice ตาม requestId
router.get('/request/:requestId', getInvoiceByRequestIdController);

// POST /api/invoices  → สร้าง Invoice ใหม่
router.post('/', createInvoiceController);

// PATCH /api/invoices/:invoiceId/pay  → ชำระเงิน
router.patch('/:invoiceId/pay', payInvoiceController);

export default router;
