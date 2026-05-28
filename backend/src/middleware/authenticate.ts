import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { HttpError } from '../utils/httpError';
import { env } from '../config/env';
import type { TokenPayload } from '../modules/auth/auth.types';

declare global {
  namespace Express {
    interface Request {
      admin?: TokenPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Missing or invalid Authorization header'));
  }

  const token = authHeader.slice(7);

  try {
    req.admin = verifyToken(token, env.JWT_ACCESS_SECRET);
    next();
  } catch (err) {
    next(err);
  }
}
