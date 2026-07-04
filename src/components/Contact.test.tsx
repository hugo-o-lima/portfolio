import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Contact from './Contact';
import { LanguageProvider } from '../i18n/LanguageContext';
import { ContentProvider } from '../content/ContentContext';

beforeEach(() => {
  // Force pt-BR so the labels asserted below are deterministic.
  window.localStorage.clear();
  vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('pt-BR');
});

function renderContact() {
  return render(
    <LanguageProvider>
      <ContentProvider>
        <Contact />
      </ContentProvider>
    </LanguageProvider>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Contact form', () => {
  it('submits the message to /api/messages and shows a success state', async () => {
    const fetchMock = vi.fn(async (url: RequestInfo | URL, _init?: RequestInit) => {
      const u = String(url);
      if (u.includes('/api/content')) return { ok: true, json: async () => ({}) } as Response;
      if (u.includes('/api/messages')) return { ok: true, json: async () => ({ message: {} }) } as Response;
      return { ok: false, json: async () => ({}) } as Response;
    });
    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);

    const user = userEvent.setup();
    renderContact();

    await user.type(screen.getByLabelText('Nome'), 'Hugo');
    await user.type(screen.getByLabelText('Email'), 'hugo@example.com');
    await user.type(screen.getByLabelText('Mensagem'), 'Olá, tudo bem?');
    await user.click(screen.getByRole('button', { name: /enviar mensagem/i }));

    expect(await screen.findByText(/Mensagem enviada!/i)).toBeInTheDocument();

    const messageCall = fetchMock.mock.calls.find((c) => String(c[0]).includes('/api/messages'));
    expect(messageCall).toBeTruthy();
    const body = JSON.parse(messageCall![1]!.body as string);
    expect(body).toMatchObject({ name: 'Hugo', email: 'hugo@example.com', body: 'Olá, tudo bem?' });
    // honeypot left empty by a real user
    expect(body.website).toBe('');
  });

  it('shows an error state when the request fails', async () => {
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      const u = String(url);
      if (u.includes('/api/content')) return { ok: true, json: async () => ({}) } as Response;
      return { ok: false, json: async () => ({}) } as Response;
    });
    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);

    const user = userEvent.setup();
    renderContact();

    await user.type(screen.getByLabelText('Nome'), 'Hugo');
    await user.type(screen.getByLabelText('Email'), 'hugo@example.com');
    await user.type(screen.getByLabelText('Mensagem'), 'test');
    await user.click(screen.getByRole('button', { name: /enviar mensagem/i }));

    expect(await screen.findByText(/Não foi possível enviar/i)).toBeInTheDocument();
  });
});
