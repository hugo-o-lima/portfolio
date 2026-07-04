import bcrypt from 'bcrypt';
import { pool } from '../../db/client';
import { HttpError } from '../../utils/httpError';

// Admin accounts (the people who can log into the admin panel) live in the
// `admins` table. There is no role hierarchy — every admin can manage others.

const SALT_ROUNDS = 12;

export interface UserRow {
  id: string;
  email: string;
  created_at: Date;
}

export async function listUsers(): Promise<UserRow[]> {
  const { rows } = await pool.query<UserRow>(
    'SELECT id, email, created_at FROM admins ORDER BY created_at ASC'
  );
  return rows;
}

export async function createUser(email: string, password: string): Promise<UserRow> {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  try {
    const { rows } = await pool.query<UserRow>(
      `INSERT INTO admins (email, password_hash) VALUES ($1, $2)
       RETURNING id, email, created_at`,
      [email.toLowerCase().trim(), passwordHash]
    );
    return rows[0];
  } catch (err) {
    if ((err as { code?: string }).code === '23505') {
      throw new HttpError(409, 'Já existe um usuário com esse e-mail.');
    }
    throw err;
  }
}

export async function updatePassword(id: string, password: string): Promise<void> {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const { rowCount } = await pool.query(
    'UPDATE admins SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    [passwordHash, id]
  );
  if (!rowCount) throw new HttpError(404, 'Usuário não encontrado.');
  // Invalidate that user's existing sessions so a changed password takes effect.
  await pool.query('UPDATE refresh_tokens SET revoked = TRUE WHERE admin_id = $1', [id]);
}

export async function deleteUser(id: string, currentAdminId: string): Promise<void> {
  if (id === currentAdminId) {
    throw new HttpError(400, 'Você não pode excluir a própria conta.');
  }
  const { rows } = await pool.query<{ count: number }>('SELECT COUNT(*)::int AS count FROM admins');
  if ((rows[0]?.count ?? 0) <= 1) {
    throw new HttpError(409, 'Não é possível excluir o último administrador.');
  }
  const { rowCount } = await pool.query('DELETE FROM admins WHERE id = $1', [id]);
  if (!rowCount) throw new HttpError(404, 'Usuário não encontrado.');
}
