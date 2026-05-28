import React, { useEffect, useState } from 'react';
import { Github, ExternalLink } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  github_url: string | null;
  live_url: string | null;
  image_url: string | null;
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => setProjects(data.projects ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="projects" className="py-32 bg-gray-800">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Projetos</h2>
          <div className="w-24 h-1 bg-blue-500 mx-auto" />
        </div>

        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-900 rounded-2xl p-6 animate-pulse border border-gray-700">
                <div className="h-5 bg-gray-700 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-700 rounded w-full mb-2" />
                <div className="h-3 bg-gray-700 rounded w-5/6 mb-4" />
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-700 rounded-full w-16" />
                  <div className="h-6 bg-gray-700 rounded-full w-20" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="text-center text-gray-500">Erro ao carregar projetos.</p>
        )}

        {!loading && !error && projects.length === 0 && (
          <p className="text-center text-gray-500 text-lg">Em breve...</p>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <div
                key={p.id}
                className="bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700 hover:border-blue-500 card-hover flex flex-col"
              >
                {p.image_url && (
                  <div className="rounded-xl overflow-hidden mb-4 aspect-video bg-gray-800">
                    <img
                      src={p.image_url}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <h3 className="text-xl font-bold text-white mb-2">{p.title}</h3>
                <p className="text-gray-300 text-sm mb-4 flex-1 leading-relaxed">{p.description}</p>

                {p.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {p.tech_stack.map((t) => (
                      <span
                        key={t}
                        className="bg-blue-500/20 text-blue-400 text-xs px-3 py-1 rounded-full border border-blue-500/30"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 mt-auto pt-2">
                  {p.github_url && (
                    <a
                      href={p.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      <Github size={15} />
                      Código
                    </a>
                  )}
                  {p.live_url && (
                    <a
                      href={p.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-gray-400 hover:text-blue-400 transition-colors text-sm"
                    >
                      <ExternalLink size={15} />
                      Ver projeto
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects; 