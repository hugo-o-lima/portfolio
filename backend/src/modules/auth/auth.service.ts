import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { pool } from '../../db/client';
import { signAccessToken, signRefreshToken, verifyToken } from '../../utils/jwt';
import { HttpError } from '../../utils/httpError';
import { env } from '../../config/env';
import type { AdminRow, RefreshTokenRow } from './auth.types';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function login(email: string, password: string) {
  const { rows } = await pool.query<AdminRow>(
    'SELECT id, email, password_hash FROM admins WHERE email = $1',
    [email]
  );

  const admin = rows[0];
  const validPassword = admin ? await bcrypt.compare(password, admin.password_hash) : false;

  if (!admin || !validPassword) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const payload = { sub: admin.id, email: admin.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await pool.query(
    `INSERT INTO refresh_tokens (admin_id, token_hash, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
    [admin.id, hashToken(refreshToken)]
  );

  return {
    accessToken,
    refreshToken,
    admin: { id: admin.id, email: admin.email },
  };
}

export async function logout(adminId: string, rawRefreshToken: string) {
  await pool.query(
    `UPDATE refresh_tokens
     SET revoked = TRUE
     WHERE token_hash = $1 AND admin_id = $2 AND revoked = FALSE`,
    [hashToken(rawRefreshToken), adminId]
  );
}

export async function refresh(rawRefreshToken: string) {
  const payload = verifyToken(rawRefreshToken, env.JWT_REFRESH_SECRET);

  const { rows } = await pool.query<RefreshTokenRow>(
    `SELECT * FROM refresh_tokens
     WHERE token_hash = $1 AND revoked = FALSE AND expires_at > NOW()`,
    [hashToken(rawRefreshToken)]
  );

  if (!rows[0]) {
    throw new HttpError(401, 'Refresh token invalid or expired');
  }

  await pool.query(
    'UPDATE refresh_tokens SET revoked = TRUE WHERE id = $1',
    [rows[0].id]
  );

  const newPayload = { sub: payload.sub, email: payload.email };
  const accessToken = signAccessToken(newPayload);
  const newRefreshToken = signRefreshToken(newPayload);

  await pool.query(
    `INSERT INTO refresh_tokens (admin_id, token_hash, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
    [payload.sub, hashToken(newRefreshToken)]
  );

  return { accessToken, refreshToken: newRefreshToken };
}

export async function getMe(adminId: string) {
  const { rows } = await pool.query<Pick<AdminRow, 'id' | 'email' | 'created_at'>>(
    'SELECT id, email, created_at FROM admins WHERE id = $1',
    [adminId]
  );

  if (!rows[0]) {
    throw new HttpError(404, 'Admin not found');
  }

  return rows[0];
}
