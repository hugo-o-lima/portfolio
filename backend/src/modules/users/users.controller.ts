import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as usersService from './users.service';
import { createUserSchema, updatePasswordSchema } from './users.schemas';

const idSchema = z.string().uuid();

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await usersService.listUsers();
    res.status(200).json({ users });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = createUserSchema.parse(req.body);
    const user = await usersService.createUser(email, password);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const id = idSchema.parse(req.params.id);
    const { password } = updatePasswordSchema.parse(req.body);
    await usersService.updatePassword(id, password);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = idSchema.parse(req.params.id);
    await usersService.deleteUser(id, req.admin!.sub);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
