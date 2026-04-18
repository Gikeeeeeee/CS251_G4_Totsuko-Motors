import { Router } from 'express';
import { createServiceController } from './controller';

const router = Router();

router.post('/create', createServiceController);

export default router;
