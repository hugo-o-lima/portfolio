import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import GitHubRepos from './GitHubRepos';
import { LanguageProvider } from '../../i18n/LanguageContext';

function renderRepos() {
  return render(
    <LanguageProvider>
      <GitHubRepos />
    </LanguageProvider>
  );
}

function repo(id: number, name: string, fork = false) {
  return {
    id,
    name,
    html_url: `https://github.com/x/${name}`,
    description: null,
    language: 'TypeScript',
    stargazers_count: 0,
    forks_count: 0,
    fork,
    pushed_at: '2024-01-01T00:00:00Z',
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('GitHubRepos', () => {
  it('renders repos from the backend endpoint and filters out forks', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ repos: [repo(1, 'own-repo'), repo(2, 'forked-repo', true)] }),
      })) as unknown as typeof fetch
    );

    renderRepos();
    await waitFor(() => expect(screen.getByText('own-repo')).toBeInTheDocument());
    expect(screen.queryByText('forked-repo')).not.toBeInTheDocument();
  });

  it('falls back to the public GitHub API when the backend fails', async () => {
    const fetchMock = vi
      .fn()
      // first call: backend endpoint fails
      .mockResolvedValueOnce({ ok: false, status: 502, json: async () => ({}) })
      // second call: public GitHub API succeeds
      .mockResolvedValueOnce({ ok: true, json: async () => [repo(3, 'fallback-repo')] });
    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);

    renderRepos();
    await waitFor(() => expect(screen.getByText('fallback-repo')).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toContain('api.github.com');
  });

  it('shows an error message when both sources fail', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 500, json: async () => ({}) })) as unknown as typeof fetch
    );

    renderRepos();
    await waitFor(() =>
      expect(screen.getByText(/github/i, { selector: 'a' })).toBeInTheDocument()
    );
  });
});
