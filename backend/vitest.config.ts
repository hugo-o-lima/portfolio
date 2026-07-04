import { defineConfig } from 'vitest/config';

export default defineConfig({
  // The production backend/.env is root-owned (0600) and unreadable in test/CI;
  // point Vite's env loader at ./test (no .env) so it never touches it. Test env
  // vars are set in test/setup.ts instead.
  envDir: './test',
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.test.ts'],
  },
});
