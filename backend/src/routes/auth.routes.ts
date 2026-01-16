import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/roblox', AuthController.login);
router.get('/callback', AuthController.callback);
router.post('/verify', AuthController.verify);
router.post('/refresh', AuthController.refresh);
router.get('/presence', authMiddleware, AuthController.getPresence);

export default router;