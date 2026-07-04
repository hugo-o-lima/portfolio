import { Router } from 'express';
import {
  status,
  minecraftDetails,
  serverName,
  updateServerName,
  startServer,
  stopServer,
  minecraftLogs,
} from './status.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.get('/', authenticate, status);
router.get('/minecraft', authenticate, minecraftDetails);
router.get('/server-name', authenticate, serverName);
router.put('/server-name', authenticate, updateServerName);

// Minecraft server control
router.post('/minecraft/start', authenticate, startServer);
router.post('/minecraft/stop', authenticate, stopServer);
// Live log stream (SSE) — authenticated via ?token= since EventSource has no headers
router.get('/minecraft/logs', minecraftLogs);

export default router;
