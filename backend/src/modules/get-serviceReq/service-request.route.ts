import express from 'express';
import { getIntakeRequests } from './serviceRequest.controller';

const router = express.Router();

// กำหนดเส้นทาง URL เมื่อมีการเรียก GET /intake ให้ส่งไปทำงานที่ฟังก์ชัน getIntakeRequests
router.get('/intake', getIntakeRequests);

export default router;