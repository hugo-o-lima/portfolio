import type { Request, Response, NextFunction } from 'express';
import * as projectsService from './projects.service';
import { createProjectSchema, updateProjectSchema } from './projects.schemas';

export async function getPublished(_req: Request, res: Response, next: NextFunction) {
  try {
    const projects = await projectsService.listPublished();
    res.status(200).json({ projects });
  } catch (err) {
    next(err);
  }
}

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const projects = await projectsService.listAll();
    res.status(200).json({ projects });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await projectsService.findById(req.params.id);
    res.status(200).json({ project });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const body = createProjectSchema.parse(req.body);
    const project = await projectsService.create(body);
    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const body = updateProjectSchema.parse(req.body);
    const project = await projectsService.update(req.params.id, body);
    res.status(200).json({ project });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await projectsService.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
