import { Router } from 'express';
import { login, logout, me, refreshTokens } from './auth.controller';
import { authenticate } from '../../middleware/authenticate';
import { loginRateLimiter } from '../../middleware/rateLimiter';

const router = Router();

router.post('/login', loginRateLimiter, login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);
router.post('/refresh', refreshTokens);

export default router;
