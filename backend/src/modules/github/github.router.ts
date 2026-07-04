import { Router } from 'express';
import { getRepos } from './github.controller';

const router = Router();

router.get('/repos', getRepos);

export default router;
