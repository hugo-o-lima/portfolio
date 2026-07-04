import { Router } from 'express';
import { getAll, updateSection, translate } from './content.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.get('/', getAll);
router.post('/translate/:from/:to/:section', authenticate, translate);
router.put('/:lang/:section', authenticate, updateSection);

export default router;
