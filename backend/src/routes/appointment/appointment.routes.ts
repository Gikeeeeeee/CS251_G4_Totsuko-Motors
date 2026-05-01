import { Router } from 'express';
import {
  createAppointmentController,
  getAppointmentsByRequestIdController,
  updateAppointmentController,
  quickCreateAppointmentController,
  getAllAppointmentsController,
} from '../../controllers/appointment/appointment.controller';

const router = Router();

router.get('/', getAllAppointmentsController);
router.post('/', createAppointmentController);
router.post('/quick-create', quickCreateAppointmentController);
router.get('/request/:requestId', getAppointmentsByRequestIdController);
router.put('/:appointmentId', updateAppointmentController);

export default router;
