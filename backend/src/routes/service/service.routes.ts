import { Router } from 'express';
import { getServiceRequests } from '../../controllers/service/dashboard-detail.controller';
import { createUsePart } from '../../controllers/service/part-usage.controller';
import {
  createServiceJob,
  getServiceJob,
  updateServiceJob,
} from '../../controllers/service/service-job.controller';
import { createServiceController } from '../../controllers/service/service-request.controller';
import { getTechnicianRequests } from '../../controllers/service/technician-requests.controller';
import {
  getAvailableParts,
  getPurchaseOrders,
  getPurchaseOrderParts,
  updateOrderStatus,
  postPurchaseOrder,
  getSuppliers,
} from '../../controllers/service/purchase-order.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/service-request', getServiceRequests);
router.post('/service-request/create', createServiceController);
router.post('/:serviceId/service-job', createServiceJob);
router.get('/service-job/:id', getServiceJob);
router.put('/service-job/:id', updateServiceJob);
router.post('/service-job/:id/parts', createUsePart);
router.get('/technician/requests', getTechnicianRequests);

router.get('/suppliers', getSuppliers);// เส้นดึงข้อมูลรายชื่อ supplier
router.get('/parts', getAvailableParts);// เส้นดึงข้อมูลอะไหล่ที่มีอยู่ในระบบ
router.post('/order', authMiddleware, postPurchaseOrder);// เส้นทางสำหรับสร้างใบสั่งซื้อใหม่ (ต้องมีการตรวจสอบสิทธิ์)
router.get('/PurchaseOrders', getPurchaseOrders);// เส้นดึงรายการใบสั่งซื้อทั้งหมด
router.get('/PurchaseOrderParts/:po_id', getPurchaseOrderParts);// เส้นดึงรายการอะไหล่ในใบสั่งซื้อแต่ละใบ
router.patch('/PurchaseOrders/:id', authMiddleware, updateOrderStatus);// เส้นทางสำหรับอัปเดตสถานะใบสั่งซื้อ (ต้องมีการตรวจสอบสิทธิ์)

export default router;
