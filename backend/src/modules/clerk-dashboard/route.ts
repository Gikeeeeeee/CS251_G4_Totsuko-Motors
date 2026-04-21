// clerk-dashboard.route.ts
import { Router } from 'express';
import { ClerkDashboardController } from './controller';

const router = Router();
const controller = new ClerkDashboardController();

// หน้าที่ Route: มอบหมายงานให้ Controller
// ใช้ GET / ซึ่งจะไปต่อท้าย /api/service ใน app.ts
router.get('/', controller.getServiceRequests);

export default router;