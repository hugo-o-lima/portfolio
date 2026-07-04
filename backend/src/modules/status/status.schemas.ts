import { z } from 'zod';

export const serverNameSchema = z.object({
  name: z.string().trim().min(1).max(100),
});
