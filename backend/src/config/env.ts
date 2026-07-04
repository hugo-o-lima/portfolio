import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  GITHUB_USERNAME: z.string().default('hugo-o-lima'),
  GITHUB_TOKEN: z.string().optional(),
  SEED_ADMIN_EMAIL: z.string().email().optional(),
  SEED_ADMIN_PASSWORD: z.string().min(12).optional(),
  // Optional contact email to raise the free MyMemory translation quota.
  TRANSLATE_EMAIL: z.string().email().optional(),
  // Minecraft server control (runs as a dedicated system user inside a screen session).
  MC_USER: z.string().default('minecraftserver'),
  MC_SERVER_DIR: z.string().default('/home/minecraftserver/server'),
  MC_SCREEN: z.string().default('minecraft'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
