// Runs before any test module is imported. `src/config/env.ts` validates
// process.env with zod at import time and calls process.exit(1) on failure,
// so every required variable must be present here. Existing env (e.g. the
// DATABASE_URL injected by CI) always wins over these defaults.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ||= 'postgresql://portfolio_test:portfolio_test@localhost:5432/portfolio_test';
process.env.JWT_ACCESS_SECRET ||= 'test_access_secret_at_least_32_chars_long_xx';
process.env.JWT_REFRESH_SECRET ||= 'test_refresh_secret_at_least_32_chars_long_x';
process.env.CORS_ORIGIN ||= 'http://localhost:5173';
