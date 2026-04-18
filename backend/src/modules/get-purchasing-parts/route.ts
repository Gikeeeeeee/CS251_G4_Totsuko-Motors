import { Router } from 'express';
import { getPurchasingPartsController } from './controller';

const router = Router();

router.get('/', getPurchasingPartsController);

export default router;
