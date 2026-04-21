import { Router } from 'express';
import { getServiceRequests } from '../../controllers/service/clerk-dashboard.controller';
import { createUsePart } from '../../controllers/service/part-usage.controller';
import {
  createServiceJob,
  updateServiceJob,
} from '../../controllers/service/service-job.controller';
import { createServiceController } from '../../controllers/service/service-request.controller';

const router = Router();

router.get('/service-request', getServiceRequests);
router.post('/service-request/create', createServiceController);
router.post('/:serviceId/service-job', createServiceJob);
router.put('/service-job/:id', updateServiceJob);
router.post('/service-job/:id/parts', createUsePart);

export default router;
