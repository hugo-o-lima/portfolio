import { Router } from 'express';
import { create, getAll, markRead, remove } from './messages.controller';
import { authenticate } from '../../middleware/authenticate';
import { contactRateLimiter } from '../../middleware/rateLimiter';

const router = Router();

router.post('/', contactRateLimiter, create);
router.get('/', authenticate, getAll);
router.patch('/:id/read', authenticate, markRead);
router.delete('/:id', authenticate, remove);

export default router;
