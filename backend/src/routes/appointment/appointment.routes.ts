import { Router } from 'express';
import { createAppointmentController, getAppointmentsByRequestIdController, updateAppointmentController } from '../../controllers/appointment/appointment.controller';

const router = Router();

router.post('/', createAppointmentController);
router.get('/request/:requestId', getAppointmentsByRequestIdController);
router.put('/:appointmentId', updateAppointmentController);

export default router;
