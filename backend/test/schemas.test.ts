import { describe, it, expect } from 'vitest';
import { createMessageSchema } from '../src/modules/messages/messages.schemas';
import { loginSchema } from '../src/modules/auth/auth.schemas';
import { createProjectSchema, updateProjectSchema } from '../src/modules/projects/projects.schemas';
import { createUserSchema, updatePasswordSchema } from '../src/modules/users/users.schemas';
import { serverNameSchema } from '../src/modules/status/status.schemas';

describe('createMessageSchema', () => {
  it('accepts a valid message', () => {
    const parsed = createMessageSchema.parse({
      name: 'Hugo',
      email: 'hugo@example.com',
      body: 'Olá!',
    });
    expect(parsed.name).toBe('Hugo');
    expect(parsed.subject).toBeUndefined();
  });

  it('keeps the honeypot field when provided', () => {
    const parsed = createMessageSchema.parse({
      name: 'Bot',
      email: 'bot@example.com',
      body: 'spam',
      website: 'http://spam.example',
    });
    expect(parsed.website).toBe('http://spam.example');
  });

  it('rejects an invalid email', () => {
    expect(() => createMessageSchema.parse({ name: 'x', email: 'not-an-email', body: 'hi' })).toThrow();
  });

  it('rejects an empty body', () => {
    expect(() => createMessageSchema.parse({ name: 'x', email: 'a@b.com', body: '' })).toThrow();
  });

  it('rejects a name over 120 chars and a body over 5000 chars', () => {
    expect(() =>
      createMessageSchema.parse({ name: 'a'.repeat(121), email: 'a@b.com', body: 'hi' })
    ).toThrow();
    expect(() =>
      createMessageSchema.parse({ name: 'x', email: 'a@b.com', body: 'a'.repeat(5001) })
    ).toThrow();
  });
});

describe('loginSchema', () => {
  it('requires a valid email and non-empty password', () => {
    expect(loginSchema.parse({ email: 'a@b.com', password: 'x' })).toBeTruthy();
    expect(() => loginSchema.parse({ email: 'a@b.com', password: '' })).toThrow();
  });
});

describe('project schemas', () => {
  it('applies defaults for tech_stack, display_order and published', () => {
    const p = createProjectSchema.parse({ title: 'T', description: 'D' });
    expect(p.tech_stack).toEqual([]);
    expect(p.display_order).toBe(0);
    expect(p.published).toBe(true);
  });

  it('rejects a non-URL github_url', () => {
    expect(() => createProjectSchema.parse({ title: 'T', description: 'D', github_url: 'nope' })).toThrow();
  });

  it('update schema is fully partial', () => {
    expect(updateProjectSchema.parse({})).toEqual({});
    expect(updateProjectSchema.parse({ title: 'only title' }).title).toBe('only title');
  });
});

describe('user schemas', () => {
  it('enforces a 12-char minimum password', () => {
    expect(() => createUserSchema.parse({ email: 'a@b.com', password: 'short' })).toThrow();
    expect(createUserSchema.parse({ email: 'a@b.com', password: 'longenough12' })).toBeTruthy();
    expect(() => updatePasswordSchema.parse({ password: 'short' })).toThrow();
  });
});

describe('serverNameSchema', () => {
  it('trims and bounds the name', () => {
    expect(serverNameSchema.parse({ name: '  My Server  ' }).name).toBe('My Server');
    expect(() => serverNameSchema.parse({ name: '' })).toThrow();
    expect(() => serverNameSchema.parse({ name: 'a'.repeat(101) })).toThrow();
  });
});
