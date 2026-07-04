import { z } from 'zod';

export const createMessageSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  subject: z.string().max(200).nullable().optional(),
  body: z.string().min(1).max(5000),
  // Honeypot: real users never fill this hidden field. Non-empty => bot.
  website: z.string().optional(),
});
