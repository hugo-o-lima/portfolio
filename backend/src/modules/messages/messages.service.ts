import { pool } from '../../db/client';
import { HttpError } from '../../utils/httpError';
import type { MessageRow } from './messages.types';

interface CreateData {
  name: string;
  email: string;
  subject?: string | null;
  body: string;
}

export async function create(data: CreateData): Promise<MessageRow> {
  const { rows } = await pool.query<MessageRow>(
    `INSERT INTO messages (name, email, subject, body)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.name, data.email, data.subject ?? null, data.body]
  );
  return rows[0];
}

export async function listAll(): Promise<MessageRow[]> {
  const { rows } = await pool.query<MessageRow>(
    `SELECT * FROM messages ORDER BY created_at DESC`
  );
  return rows;
}

export async function markRead(id: string): Promise<MessageRow> {
  const { rows, rowCount } = await pool.query<MessageRow>(
    `UPDATE messages SET is_read = TRUE WHERE id = $1 RETURNING *`,
    [id]
  );
  if (!rowCount || rowCount === 0) throw new HttpError(404, 'Message not found');
  return rows[0];
}

export async function remove(id: string): Promise<void> {
  const { rowCount } = await pool.query('DELETE FROM messages WHERE id = $1', [id]);
  if (!rowCount || rowCount === 0) throw new HttpError(404, 'Message not found');
}
