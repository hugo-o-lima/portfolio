import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12, 'A senha deve ter ao menos 12 caracteres'),
});

export const updatePasswordSchema = z.object({
  password: z.string().min(12, 'A senha deve ter ao menos 12 caracteres'),
});
