import type { Request, Response, NextFunction } from 'express';
import * as githubService from './github.service';

export async function getRepos(_req: Request, res: Response, next: NextFunction) {
  try {
    const repos = await githubService.listRepos();
    res.set('Cache-Control', 'public, max-age=300');
    res.status(200).json({ repos });
  } catch (err) {
    next(err);
  }
}
