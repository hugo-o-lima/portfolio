import { describe, it, expect } from 'vitest';
import { signAccessToken, signRefreshToken, verifyToken } from '../src/utils/jwt';
import { HttpError } from '../src/utils/httpError';

const payload = { sub: 'admin-123', email: 'admin@example.com' };

describe('jwt utils', () => {
  it('round-trips an access token', () => {
    const token = signAccessToken(payload);
    const decoded = verifyToken(token, process.env.JWT_ACCESS_SECRET!);
    expect(decoded.sub).toBe(payload.sub);
    expect(decoded.email).toBe(payload.email);
  });

  it('round-trips a refresh token', () => {
    const token = signRefreshToken(payload);
    const decoded = verifyToken(token, process.env.JWT_REFRESH_SECRET!);
    expect(decoded.sub).toBe(payload.sub);
  });

  it('throws HttpError(401) on a tampered token', () => {
    try {
      verifyToken('not.a.valid.token', process.env.JWT_ACCESS_SECRET!);
      expect.unreachable('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(HttpError);
      expect((err as HttpError).statusCode).toBe(401);
    }
  });

  it('rejects an access token verified with the refresh secret', () => {
    const token = signAccessToken(payload);
    expect(() => verifyToken(token, process.env.JWT_REFRESH_SECRET!)).toThrow(HttpError);
  });
});
