import type { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { loginSchema, refreshSchema } from './auth.schemas';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const body = loginSchema.parse(req.body);
    const result = await authService.login(body.email, body.password);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    await authService.logout(req.admin!.sub, refreshToken);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const admin = await authService.getMe(req.admin!.sub);
    res.status(200).json(admin);
  } catch (err) {
    next(err);
  }
}

export async function refreshTokens(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const result = await authService.refresh(refreshToken);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
