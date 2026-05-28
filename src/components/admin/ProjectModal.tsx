import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ProjectData {
  id?: string;
  title: string;
  description: string;
  tech_stack: string[];
  github_url: string | null;
  live_url: string | null;
  image_url: string | null;
  display_order: number;
  published: boolean;
}

interface Props {
  project?: ProjectData;
  accessToken: string;
  onSuccess: () => void;
  onClose: () => void;
}

const emptyForm = {
  title: '',
  description: '',
  techInput: '',
  github_url: '',
  live_url: '',
  image_url: '',
  display_order: 0,
  published: true,
};

export default function ProjectModal({ project, accessToken, onSuccess, onClose }: Props) {
  const [form, setForm] = useState({
    title: project?.title ?? '',
    description: project?.description ?? '',
    techInput: project?.tech_stack.join(', ') ?? '',
    github_url: project?.github_url ?? '',
    live_url: project?.live_url ?? '',
    image_url: project?.image_url ?? '',
    display_order: project?.display_order ?? 0,
    published: project?.published ?? true,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditing = !!project?.id;

  function set<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const tech_stack = form.techInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const body = {
      title: form.title,
      description: form.description,
      tech_stack,
      github_url: form.github_url || null,
      live_url: form.live_url || null,
      image_url: form.image_url || null,
      display_order: Number(form.display_order),
      published: form.published,
    };

    try {
      const url = isEditing ? `/api/projects/${project!.id}` : '/api/projects';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Erro ao salvar projeto');
        return;
      }

      onSuccess();
    } catch {
      setError('Erro de conexão');
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    'w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors text-sm';

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white">
            {isEditing ? 'Editar Projeto' : 'Novo Projeto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Título <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              required
              className={inputClass}
              placeholder="Nome do projeto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Descrição <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              required
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Descreva o projeto..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Tecnologias
            </label>
            <input
              type="text"
              value={form.techInput}
              onChange={(e) => set('techInput', e.target.value)}
              className={inputClass}
              placeholder="React, TypeScript, Node.js"
            />
            <p className="text-gray-500 text-xs mt-1">Separe por vírgula</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                GitHub URL
              </label>
              <input
                type="url"
                value={form.github_url}
                onChange={(e) => set('github_url', e.target.value)}
                className={inputClass}
                placeholder="https://github.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                URL ao vivo
              </label>
              <input
                type="url"
                value={form.live_url}
                onChange={(e) => set('live_url', e.target.value)}
                className={inputClass}
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              URL da imagem
            </label>
            <input
              type="url"
              value={form.image_url}
              onChange={(e) => set('image_url', e.target.value)}
              className={inputClass}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Ordem
              </label>
              <input
                type="number"
                min={0}
                value={form.display_order}
                onChange={(e) => set('display_order', Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col justify-end pb-0.5">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => set('published', e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      form.published ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  />
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      form.published ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
                <span className="text-sm font-medium text-gray-300">Publicado</span>
              </label>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
