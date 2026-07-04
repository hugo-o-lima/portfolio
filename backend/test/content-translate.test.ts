import { describe, it, expect, vi, afterEach } from 'vitest';
import { translateSection } from '../src/modules/content/content.translate';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function mockFetchTranslating() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      json: async () => ({ responseData: { translatedText: 'TRADUZIDO' } }),
    })) as unknown as typeof fetch
  );
}

describe('translateSection (contact)', () => {
  const contact = {
    email: 'hugo@example.com',
    phone: '+55 44 90000-0000',
    phoneHref: 'tel:+5544900000000',
    location: 'Maringá, Brasil',
    githubUrl: 'https://github.com/hugo-o-lima',
    linkedinUrl: 'https://linkedin.com/in/hugo',
  };

  it('translates only the location and preserves neutral fields (urls, email, phone)', async () => {
    mockFetchTranslating();
    const out = (await translateSection('contact', contact, 'pt', 'en')) as typeof contact;
    expect(out.location).toBe('TRADUZIDO');
    expect(out.email).toBe(contact.email);
    expect(out.phone).toBe(contact.phone);
    expect(out.githubUrl).toBe(contact.githubUrl);
    expect(out.linkedinUrl).toBe(contact.linkedinUrl);
  });

  it('falls back to the original text when the translation API fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('network down'); }) as unknown as typeof fetch);
    const out = (await translateSection('contact', contact, 'pt', 'en')) as typeof contact;
    expect(out.location).toBe(contact.location);
  });

  it('skips network calls entirely when from === to', async () => {
    const spy = vi.fn();
    vi.stubGlobal('fetch', spy as unknown as typeof fetch);
    const out = (await translateSection('contact', contact, 'pt', 'pt')) as typeof contact;
    expect(out.location).toBe(contact.location);
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('translateSection (services)', () => {
  it('translates title/description but keeps icon and tags', async () => {
    mockFetchTranslating();
    const services = {
      items: [{ icon: 'Code', tags: ['React', 'Node'], title: 'Front-end', description: 'Faço UIs' }],
    };
    const out = (await translateSection('services', services, 'pt', 'en')) as typeof services;
    expect(out.items[0].title).toBe('TRADUZIDO');
    expect(out.items[0].description).toBe('TRADUZIDO');
    expect(out.items[0].icon).toBe('Code');
    expect(out.items[0].tags).toEqual(['React', 'Node']);
  });
});
