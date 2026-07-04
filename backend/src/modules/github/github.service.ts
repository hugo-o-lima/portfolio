import { env } from '../../config/env';
import { HttpError } from '../../utils/httpError';
import type { GitHubRepo } from './github.types';

/* Cache em memória: evita o rate limit da API do GitHub (60 req/h por IP
   sem token). Em caso de falha, serve a última resposta válida (stale). */
const CACHE_TTL_MS = 10 * 60 * 1000;

interface RepoCache {
  repos: GitHubRepo[];
  fetchedAt: number;
}

let cache: RepoCache | null = null;

export async function listRepos(): Promise<GitHubRepo[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.repos;
  }

  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'portfolio-backend',
    };
    if (env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
    }

    const res = await fetch(
      `https://api.github.com/users/${env.GITHUB_USERNAME}/repos?per_page=100&sort=pushed`,
      { headers }
    );

    if (!res.ok) {
      throw new HttpError(502, `GitHub API returned ${res.status}`);
    }

    const data = (await res.json()) as Array<Record<string, unknown>>;
    const repos: GitHubRepo[] = data.map((r) => ({
      id: r.id as number,
      name: r.name as string,
      html_url: r.html_url as string,
      description: (r.description as string | null) ?? null,
      language: (r.language as string | null) ?? null,
      stargazers_count: (r.stargazers_count as number) ?? 0,
      forks_count: (r.forks_count as number) ?? 0,
      fork: Boolean(r.fork),
      pushed_at: r.pushed_at as string,
    }));

    cache = { repos, fetchedAt: Date.now() };
    return repos;
  } catch (err) {
    if (cache) {
      return cache.repos;
    }
    throw err instanceof HttpError ? err : new HttpError(502, 'Failed to reach GitHub API');
  }
}
