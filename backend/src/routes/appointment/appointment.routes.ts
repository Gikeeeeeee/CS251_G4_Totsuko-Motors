import { Router } from 'express';
import { createAppointmentController, getAppointmentsByRequestIdController } from '../../controllers/appointment/appointment.controller';

const router = Router();

router.post('/', createAppointmentController);
router.get('/request/:requestId', getAppointmentsByRequestIdController);

export default router;
