import { pool } from '../../db/client';
import { HttpError } from '../../utils/httpError';
import type { ProjectRow } from './projects.types';
import type { z } from 'zod';
import type { createProjectSchema, updateProjectSchema } from './projects.schemas';

type CreateData = z.infer<typeof createProjectSchema>;
type UpdateData = z.infer<typeof updateProjectSchema>;

export async function listPublished(): Promise<ProjectRow[]> {
  const { rows } = await pool.query<ProjectRow>(
    `SELECT * FROM projects
     WHERE published = TRUE
     ORDER BY display_order ASC, created_at ASC`
  );
  return rows;
}

export async function listAll(): Promise<ProjectRow[]> {
  const { rows } = await pool.query<ProjectRow>(
    `SELECT * FROM projects ORDER BY display_order ASC, created_at ASC`
  );
  return rows;
}

export async function findById(id: string): Promise<ProjectRow> {
  const { rows } = await pool.query<ProjectRow>(
    'SELECT * FROM projects WHERE id = $1',
    [id]
  );
  if (!rows[0]) throw new HttpError(404, 'Project not found');
  return rows[0];
}

export async function create(data: CreateData): Promise<ProjectRow> {
  const { rows } = await pool.query<ProjectRow>(
    `INSERT INTO projects
       (title, description, title_en, description_en, tech_stack, github_url, live_url, image_url, display_order, published)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      data.title,
      data.description,
      data.title_en ?? null,
      data.description_en ?? null,
      data.tech_stack,
      data.github_url ?? null,
      data.live_url ?? null,
      data.image_url ?? null,
      data.display_order,
      data.published,
    ]
  );
  return rows[0];
}

export async function update(id: string, data: UpdateData): Promise<ProjectRow> {
  const keys = Object.keys(data) as (keyof UpdateData)[];
  if (keys.length === 0) return findById(id);

  const setClauses = keys.map((key, i) => `"${key}" = $${i + 1}`);
  setClauses.push('updated_at = NOW()');
  const values = [...keys.map((k) => data[k]), id];

  const { rows, rowCount } = await pool.query<ProjectRow>(
    `UPDATE projects SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`,
    values
  );

  if (!rowCount || rowCount === 0) throw new HttpError(404, 'Project not found');
  return rows[0];
}

export async function remove(id: string): Promise<void> {
  const { rowCount } = await pool.query(
    'DELETE FROM projects WHERE id = $1',
    [id]
  );
  if (!rowCount || rowCount === 0) throw new HttpError(404, 'Project not found');
}
