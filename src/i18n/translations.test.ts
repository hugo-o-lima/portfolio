import { describe, it, expect } from 'vitest';
import { translations } from './translations';

// Recursively collect the dotted key paths of an object (arrays treated as leaves).
function keyPaths(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return [prefix];
  return Object.entries(obj as Record<string, unknown>)
    .flatMap(([k, v]) => keyPaths(v, prefix ? `${prefix}.${k}` : k))
    .sort();
}

describe('translations', () => {
  it('pt and en have exactly the same key structure', () => {
    const pt = keyPaths(translations.pt).sort();
    const en = keyPaths(translations.en).sort();
    expect(en).toEqual(pt);
  });

  it('includes the new contact form keys in both languages', () => {
    for (const lang of ['pt', 'en'] as const) {
      const form = translations[lang].contact.form;
      expect(form.send).toBeTruthy();
      expect(form.success).toBeTruthy();
      expect(form.error).toBeTruthy();
    }
  });
});
