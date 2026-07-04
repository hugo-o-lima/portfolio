import { useEffect, useState } from 'react';
import { Star, GitFork } from 'lucide-react';
import { useLanguage } from '../../i18n/useLanguage';

interface Repo {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  pushed_at: string;
}

export default function GitHubRepos() {
  const { t } = useLanguage();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    /* Tenta primeiro o endpoint do backend (com cache, sem rate limit);
       se ele estiver fora do ar, cai direto na API do GitHub. */
    async function load(): Promise<Repo[]> {
      try {
        const res = await fetch('/api/github/repos', { signal: controller.signal });
        if (!res.ok) throw new Error(`backend: ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data.repos)) throw new Error('backend: unexpected payload');
        return data.repos as Repo[];
      } catch (err) {
        if ((err as Error).name === 'AbortError') throw err;
        const res = await fetch(
          'https://api.github.com/users/hugo-o-lima/repos?per_page=100&sort=pushed',
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error(`GitHub API: ${res.status}`);
        return (await res.json()) as Repo[];
      }
    }

    load()
      .then((data) => {
        const own = data.filter((r) => !r.fork).slice(0, 6);
        setRepos(own.length > 0 ? own : data.slice(0, 6));
        setLoading(false);
      })
      .catch((err) => {
        if ((err as Error).name === 'AbortError') return;
        setError(true);
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {loading && (
        <ul className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <li key={i} className="bg-gray-900 rounded-xl p-5 border border-gray-700 animate-pulse">
              <div className="h-5 bg-gray-700 rounded w-2/3 mb-3" />
              <div className="h-3 bg-gray-700 rounded w-full mb-2" />
              <div className="h-3 bg-gray-700 rounded w-1/3" />
            </li>
          ))}
        </ul>
      )}

      {!loading && error && (
        <p className="text-gray-400 text-center">
          {t.repos.error}{' '}
          <a
            href="https://github.com/hugo-o-lima"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline underline-offset-4"
          >
            {t.repos.seeOnGitHub}
          </a>
          .
        </p>
      )}

      {!loading && !error && (
        <>
          <ul className="grid md:grid-cols-2 gap-6 text-left">
            {repos.map((repo) => (
              <li
                key={repo.id}
                className="bg-gray-900 rounded-xl p-5 shadow-lg hover:shadow-blue-500/20 transition-all border border-gray-700 hover:border-blue-500 hover:-translate-y-1 duration-300"
              >
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-lg font-semibold text-blue-400 hover:text-blue-300 transition-colors duration-200 mb-2 break-words"
                >
                  {repo.name}
                </a>
                {repo.description && (
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{repo.description}</p>
                )}
                <div className="flex items-center gap-4 text-gray-500 text-xs font-mono">
                  {repo.language && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" aria-hidden="true" />
                      {repo.language}
                    </span>
                  )}
                  {repo.stargazers_count > 0 && (
                    <span className="flex items-center gap-1">
                      <Star size={12} aria-hidden="true" /> {repo.stargazers_count}
                    </span>
                  )}
                  {repo.forks_count > 0 && (
                    <span className="flex items-center gap-1">
                      <GitFork size={12} aria-hidden="true" /> {repo.forks_count}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="text-center mt-8">
            <a
              href="https://github.com/hugo-o-lima?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors font-mono text-sm"
            >
              {t.repos.viewAll}
            </a>
          </div>
        </>
      )}
    </div>
  );
}
