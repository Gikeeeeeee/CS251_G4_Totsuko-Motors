import { Router } from 'express';
import { getPurchasingPartsController } from '../../controllers/parts/purchasing-parts.controller';

const router = Router();

router.get('/purchasing', getPurchasingPartsController);

export default router;
