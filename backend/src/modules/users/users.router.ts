import { Router } from 'express';
import { list, create, changePassword, remove } from './users.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.get('/', authenticate, list);
router.post('/', authenticate, create);
router.put('/:id/password', authenticate, changePassword);
router.delete('/:id', authenticate, remove);

export default router;
