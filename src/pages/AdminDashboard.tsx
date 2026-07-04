import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import ProjectModal from '../components/admin/ProjectModal';
import { Plus, Edit, Trash2, LogOut, Eye, EyeOff } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  title_en: string | null;
  description_en: string | null;
  tech_stack: string[];
  github_url: string | null;
  live_url: string | null;
  image_url: string | null;
  display_order: number;
  published: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const { accessToken, admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch('/api/projects/all', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setProjects(data.projects ?? []);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  function openCreate() {
    setEditingProject(undefined);
    setModalOpen(true);
  }

  function openEdit(p: Project) {
    setEditingProject(p);
    setModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete((c) => (c === id ? null : c)), 3000);
      return;
    }
    setConfirmDelete(null);
    await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken!}` },
    });
    fetchProjects();
  }

  async function handleLogout() {
    await logout();
    navigate('/admin', { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">
              <span className="text-blue-400">&lt;</span>
              hugo-antonio
              <span className="text-blue-400">/&gt;</span>
            </h1>
            <p className="text-gray-400 text-xs mt-0.5">{admin?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </header>

      {/* Nav tabs */}
      <div className="bg-gray-800 border-b border-gray-700 px-6">
        <div className="max-w-6xl mx-auto flex gap-1">
          {[
            { label: 'Projetos', path: '/admin/dashboard' },
            { label: 'Conteúdo', path: '/admin/content' },
            { label: 'Mensagens', path: '/admin/messages' },
            { label: 'Status do Servidor', path: '/admin/status' },
            { label: 'Usuários', path: '/admin/users' },
          ].map(({ label, path }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  active
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Projetos</h2>
            <div className="w-12 h-1 bg-blue-500 mt-2 rounded-full" />
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Novo Projeto
          </button>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-800 rounded-2xl p-5 animate-pulse border border-gray-700">
                <div className="h-5 bg-gray-700 rounded w-2/3 mb-3" />
                <div className="h-3 bg-gray-700 rounded w-full mb-2" />
                <div className="h-3 bg-gray-700 rounded w-4/5" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg mb-2">Nenhum projeto ainda</p>
            <p className="text-sm">Clique em "Novo Projeto" para começar</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {projects.map((p) => (
              <div
                key={p.id}
                className="bg-gray-800 rounded-2xl p-5 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-white font-semibold text-base leading-snug">{p.title}</h3>
                  <span
                    className={`shrink-0 flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${
                      p.published
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : 'bg-gray-700 text-gray-400 border-gray-600'
                    }`}
                  >
                    {p.published ? <Eye size={12} /> : <EyeOff size={12} />}
                    {p.published ? 'Publicado' : 'Rascunho'}
                  </span>
                </div>

                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{p.description}</p>

                {p.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {p.tech_stack.map((t) => (
                      <span
                        key={t}
                        className="bg-blue-500/20 text-blue-400 text-xs px-2.5 py-0.5 rounded-full border border-blue-500/30"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-xs">ordem: {p.display_order}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="flex items-center gap-1.5 text-gray-400 hover:text-blue-400 transition-colors text-sm px-3 py-1.5 rounded-lg hover:bg-blue-500/10"
                    >
                      <Edit size={14} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className={`flex items-center gap-1.5 transition-colors text-sm px-3 py-1.5 rounded-lg ${
                        confirmDelete === p.id
                          ? 'text-red-400 bg-red-500/20 hover:bg-red-500/30'
                          : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                      }`}
                    >
                      <Trash2 size={14} />
                      {confirmDelete === p.id ? 'Confirmar?' : 'Excluir'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {modalOpen && (
        <ProjectModal
          project={editingProject}
          accessToken={accessToken!}
          onSuccess={() => { setModalOpen(false); fetchProjects(); }}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
