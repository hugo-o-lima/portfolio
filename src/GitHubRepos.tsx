import { useEffect, useState } from "react";

interface Repo {
  id: number;
  name: string;
  html_url: string;
}

export default function GitHubRepos() {
  const [repos, setRepos] = useState<Repo[]>([]);

  useEffect(() => {
    fetch("https://api.github.com/users/hugo-o-lima/repos")
      .then((res) => res.json())
      .then((data) => setRepos(data.slice(0, 5)));
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl">
        <ul className="grid md:grid-cols-2 gap-6">
          {repos.map((repo) => (
            <li
              key={repo.id}
              className="bg-gray-800 rounded-xl p-5 shadow-lg hover:shadow-blue-500/30 transition-shadow border border-gray-700 hover:border-blue-500"
            >
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-lg font-semibold text-blue-400 hover:text-blue-300 transition-colors duration-200 mb-2"
              >
                {repo.name}
              </a>
              <span className="text-gray-400 text-sm">Repositório público</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
