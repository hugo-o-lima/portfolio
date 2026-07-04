import bcrypt from 'bcrypt';
import { pool } from './client';
import { env } from '../config/env';

async function seed() {
  const email = env.SEED_ADMIN_EMAIL;
  const password = env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await pool.query(
    `INSERT INTO admins (email, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (email) DO NOTHING
     RETURNING id, email`,
    [email, passwordHash]
  );

  if (result.rowCount === 0) {
    console.log(`Admin with email "${email}" already exists. No changes made.`);
  } else {
    console.log(`Admin created: ${result.rows[0].email} (id: ${result.rows[0].id})`);
  }

  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
