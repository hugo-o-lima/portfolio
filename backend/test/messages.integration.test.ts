import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { pool } from '../src/db/client';

// Integration tests hit a real Postgres (the isolated `portfolio_test` DB locally,
// or the CI service container). Migrations must have run first (`npm run migrate`).

beforeEach(async () => {
  await pool.query('DELETE FROM messages');
});

afterAll(async () => {
  await pool.query('DELETE FROM messages');
  await pool.end();
});

describe('GET /api/projects', () => {
  it('is public and returns a projects array', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.projects)).toBe(true);
  });
});

describe('POST /api/messages', () => {
  it('stores a valid message and returns it', async () => {
    const res = await request(app)
      .post('/api/messages')
      .send({ name: 'Integração', email: 'test@example.com', subject: 'Oi', body: 'Mensagem de teste' });
    expect(res.status).toBe(201);
    expect(res.body.message).toMatchObject({
      name: 'Integração',
      email: 'test@example.com',
      subject: 'Oi',
      is_read: false,
    });

    const { rows } = await pool.query('SELECT * FROM messages');
    expect(rows).toHaveLength(1);
    expect(rows[0].body).toBe('Mensagem de teste');
  });

  it('silently drops a submission that trips the honeypot (no row persisted)', async () => {
    const res = await request(app)
      .post('/api/messages')
      .send({ name: 'Bot', email: 'bot@example.com', body: 'spam', website: 'http://evil.example' });
    expect(res.status).toBe(201);

    const { rows } = await pool.query('SELECT * FROM messages');
    expect(rows).toHaveLength(0);
  });

  it('rejects an invalid payload with 400', async () => {
    const res = await request(app)
      .post('/api/messages')
      .send({ name: '', email: 'not-an-email', body: '' });
    expect(res.status).toBe(400);
  });
});

describe('protected message routes', () => {
  it('returns 401 for GET /api/messages without a token', async () => {
    const res = await request(app).get('/api/messages');
    expect(res.status).toBe(401);
  });

  it('returns 401 for DELETE /api/messages/:id without a token', async () => {
    const res = await request(app).delete('/api/messages/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(401);
  });
});
