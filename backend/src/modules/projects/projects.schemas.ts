import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  title_en: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
  tech_stack: z.array(z.string()).optional().default([]),
  github_url: z.string().url().nullable().optional(),
  live_url: z.string().url().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  display_order: z.number().int().optional().default(0),
  published: z.boolean().optional().default(true),
});

export const updateProjectSchema = createProjectSchema.partial();
