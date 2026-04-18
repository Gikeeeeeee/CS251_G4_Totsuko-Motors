import { Router } from 'express';
import { login, logout, verify, register, refresh } from '../../controllers/auth/auth.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.get('/verify', authMiddleware, verify);
router.post('/refresh', refresh);

export default router;
