import type { Request, Response, NextFunction } from 'express';
import * as messagesService from './messages.service';
import { createMessageSchema } from './messages.schemas';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { website, ...body } = createMessageSchema.parse(req.body);
    // Honeypot tripped: pretend success but do not persist anything.
    if (website && website.trim() !== '') {
      res.status(201).json({ ok: true });
      return;
    }
    const message = await messagesService.create(body);
    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
}

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const messages = await messagesService.listAll();
    res.status(200).json({ messages });
  } catch (err) {
    next(err);
  }
}

export async function markRead(req: Request, res: Response, next: NextFunction) {
  try {
    const message = await messagesService.markRead(req.params.id);
    res.status(200).json({ message });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await messagesService.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
