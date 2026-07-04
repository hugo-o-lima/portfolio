import type { Request, Response, NextFunction } from 'express';
import * as contentService from './content.service';
import { sectionSchemas } from './content.schemas';
import { contentSections, langs, type ContentSection, type Lang } from './content.defaults';
import { translateSection } from './content.translate';
import { HttpError } from '../../utils/httpError';

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const content = await contentService.getContent();
    res.status(200).json({ content });
  } catch (err) {
    next(err);
  }
}

export async function updateSection(req: Request, res: Response, next: NextFunction) {
  try {
    const lang = req.params.lang as Lang;
    if (!langs.includes(lang)) {
      throw new HttpError(404, 'Unknown language');
    }
    const section = req.params.section as ContentSection;
    if (!contentSections.includes(section)) {
      throw new HttpError(404, 'Unknown content section');
    }
    const value = sectionSchemas[section].parse(req.body);
    const saved = await contentService.setSection(lang, section, value);
    res.status(200).json({ lang, section, value: saved });
  } catch (err) {
    next(err);
  }
}

// Auto-translates a section's text from one language to another (does not save).
export async function translate(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to, section } = req.params as { from: Lang; to: Lang; section: ContentSection };
    if (!langs.includes(from) || !langs.includes(to)) {
      throw new HttpError(404, 'Unknown language');
    }
    if (!contentSections.includes(section)) {
      throw new HttpError(404, 'Unknown content section');
    }
    const value = sectionSchemas[section].parse(req.body);
    const translated = await translateSection(section, value, from, to);
    res.status(200).json({ from, to, section, value: translated });
  } catch (err) {
    next(err);
  }
}
