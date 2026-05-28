import { Router } from 'express';
import { getPublished, getAll, getOne, create, update, remove } from './projects.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.get('/', getPublished);
router.get('/all', authenticate, getAll);
router.get('/:id', getOne);
router.post('/', authenticate, create);
router.put('/:id', authenticate, update);
router.delete('/:id', authenticate, remove);

export default router;
