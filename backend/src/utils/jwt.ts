import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { HttpError } from './httpError';
import type { TokenPayload } from '../modules/auth/auth.types';

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string, secret: string): TokenPayload {
  try {
    return jwt.verify(token, secret) as TokenPayload;
  } catch {
    throw new HttpError(401, 'Invalid or expired token');
  }
}
