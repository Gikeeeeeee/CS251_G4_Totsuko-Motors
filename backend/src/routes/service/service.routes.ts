import { Router } from 'express';
<<<<<<< HEAD
import { getServiceRequests, getServiceRequestByIdController } from '../../controllers/service/dashboard-detail.controller';
=======
import { getServiceRequests } from '../../controllers/service/dashboard-detail.controller';
>>>>>>> ee4cb16d0332328b098140b08b135159a09413bf
import { createUsePart } from '../../controllers/service/part-usage.controller';
import {
  createServiceJob,
  getServiceJob,
  updateServiceJob,
  getServiceJobsByRequestId,
  assignTechnicianToJob,
  replaceServiceJobPartsHandler,
  replaceServiceJobTechniciansHandler,
  removeTechnicianFromJob,
  deleteServiceJobHandler,
} from '../../controllers/service/service-job.controller';
import { createServiceController } from '../../controllers/service/service-request.controller';
import {
  getAvailableParts,
  getPurchaseOrders,
  getPurchaseOrderParts,
  updateOrderStatus,
  postPurchaseOrder,
  getSuppliers
} from '../../controllers/service/purchase-order.controller';

import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/service-request', getServiceRequests);
router.get('/service-request/:requestId', getServiceRequestByIdController);
router.post('/service-request/create', createServiceController);
router.get('/:requestId/service-jobs', getServiceJobsByRequestId);
router.post('/:serviceId/service-job', createServiceJob);
router.get('/service-job/:id', getServiceJob);
router.put('/service-job/:id', updateServiceJob);
router.put('/service-job/:id/parts', replaceServiceJobPartsHandler);
router.put('/service-job/:id/assign', replaceServiceJobTechniciansHandler);
router.post('/service-job/:id/parts', createUsePart);
router.post('/service-job/:id/assign', assignTechnicianToJob);
router.delete('/service-job/:id', deleteServiceJobHandler);
router.delete('/service-job/:id/assign/:technicianId', removeTechnicianFromJob);

router.get('/suppliers', getSuppliers);// เส้นดึงข้อมูลรายชื่อ supplier
router.get('/parts', getAvailableParts);// เส้นดึงข้อมูลอะไหล่ที่มีอยู่ในระบบ
router.post('/order', authMiddleware, postPurchaseOrder);// เส้นทางสำหรับสร้างใบสั่งซื้อใหม่ (ต้องมีการตรวจสอบสิทธิ์)
router.get('/PurchaseOrders', getPurchaseOrders);// เส้นดึงรายการใบสั่งซื้อทั้งหมด
router.get('/PurchaseOrderParts/:po_id', getPurchaseOrderParts);// เส้นดึงรายการอะไหล่ในใบสั่งซื้อแต่ละใบ
router.patch('/PurchaseOrders/:id', authMiddleware, updateOrderStatus);// เส้นทางสำหรับอัปเดตสถานะใบสั่งซื้อ (ต้องมีการตรวจสอบสิทธิ์)

export default router;
