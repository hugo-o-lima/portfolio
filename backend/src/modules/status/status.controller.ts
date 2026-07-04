import type { Request, Response, NextFunction } from 'express';
import {
  getStatus,
  getMinecraftDetails,
  getServerName,
  setServerName,
  startMinecraft,
  stopMinecraft,
  streamMinecraftLog,
} from './status.service';
import { serverNameSchema } from './status.schemas';
import { verifyToken } from '../../utils/jwt';
import { HttpError } from '../../utils/httpError';
import { env } from '../../config/env';

export async function status(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getStatus();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function minecraftDetails(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getMinecraftDetails();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function serverName(_req: Request, res: Response, next: NextFunction) {
  try {
    const name = await getServerName();
    res.status(200).json({ name });
  } catch (err) {
    next(err);
  }
}

export async function updateServerName(req: Request, res: Response, next: NextFunction) {
  try {
    const { name } = serverNameSchema.parse(req.body);
    const saved = await setServerName(name);
    res.status(200).json({ name: saved });
  } catch (err) {
    next(err);
  }
}

export async function startServer(_req: Request, res: Response, next: NextFunction) {
  try {
    const result = await startMinecraft();
    res.status(result.ok ? 200 : 409).json(result);
  } catch (err) {
    next(err);
  }
}

export async function stopServer(_req: Request, res: Response, next: NextFunction) {
  try {
    const result = await stopMinecraft();
    res.status(result.ok ? 200 : 409).json(result);
  } catch (err) {
    next(err);
  }
}

// Server-Sent Events stream of the live Minecraft log. EventSource cannot send an
// Authorization header, so the access token is passed (and verified) via query string.
export function minecraftLogs(req: Request, res: Response, next: NextFunction) {
  const token = typeof req.query.token === 'string' ? req.query.token : '';
  try {
    req.admin = verifyToken(token, env.JWT_ACCESS_SECRET);
  } catch {
    return next(new HttpError(401, 'Invalid or expired token'));
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // disable nginx proxy buffering for this stream
  });
  res.write('retry: 3000\n\n');

  const send = (line: string) => {
    // Each SSE event is a single data line; blank line terminates the event.
    res.write(`data: ${line}\n\n`);
  };

  const child = streamMinecraftLog(send);
  const heartbeat = setInterval(() => res.write(': ping\n\n'), 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    child.kill();
    res.end();
  });
}
