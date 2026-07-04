import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { LogOut, Trash2, MailOpen, Mail } from 'lucide-react';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  body: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminMessages() {
  const { accessToken, admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch('/api/messages', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setMessages(data.messages ?? []);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  async function handleMarkRead(id: string) {
    await fetch(`/api/messages/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken!}` },
    });
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: true } : m)));
  }

  async function handleDelete(id: string) {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete((c) => (c === id ? null : c)), 3000);
      return;
    }
    setConfirmDelete(null);
    await fetch(`/api/messages/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken!}` },
    });
    fetchMessages();
  }

  async function handleLogout() {
    await logout();
    navigate('/admin', { replace: true });
  }

  const unreadCount = messages.filter((m) => !m.is_read).length;

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
            <h2 className="text-2xl font-bold text-white">
              Mensagens
              {unreadCount > 0 && (
                <span className="ml-3 align-middle text-sm bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                  {unreadCount} {unreadCount === 1 ? 'não lida' : 'não lidas'}
                </span>
              )}
            </h2>
            <div className="w-12 h-1 bg-blue-500 mt-2 rounded-full" />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-800 rounded-2xl p-5 animate-pulse border border-gray-700">
                <div className="h-5 bg-gray-700 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-700 rounded w-full mb-2" />
                <div className="h-3 bg-gray-700 rounded w-4/5" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg mb-2">Nenhuma mensagem ainda</p>
            <p className="text-sm">As mensagens enviadas pelo formulário de contato aparecem aqui</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`bg-gray-800 rounded-2xl p-5 border transition-colors ${
                  m.is_read ? 'border-gray-700' : 'border-blue-500/40 bg-blue-500/[0.03]'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-semibold text-base leading-snug">{m.name}</h3>
                      <a
                        href={`mailto:${m.email}`}
                        className="text-blue-400 hover:text-blue-300 text-sm break-all"
                      >
                        &lt;{m.email}&gt;
                      </a>
                      {!m.is_read && (
                        <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          Nova
                        </span>
                      )}
                    </div>
                    {m.subject && <p className="text-gray-300 text-sm mt-1 font-medium">{m.subject}</p>}
                  </div>
                  <span className="shrink-0 text-gray-600 text-xs">
                    {new Date(m.created_at).toLocaleString('pt-BR')}
                  </span>
                </div>

                <p className="text-gray-400 text-sm whitespace-pre-wrap mb-4">{m.body}</p>

                <div className="flex items-center justify-end gap-2">
                  {!m.is_read && (
                    <button
                      onClick={() => handleMarkRead(m.id)}
                      className="flex items-center gap-1.5 text-gray-400 hover:text-blue-400 transition-colors text-sm px-3 py-1.5 rounded-lg hover:bg-blue-500/10"
                    >
                      <MailOpen size={14} />
                      Marcar como lida
                    </button>
                  )}
                  {m.is_read && (
                    <span className="flex items-center gap-1.5 text-gray-600 text-sm px-3 py-1.5">
                      <Mail size={14} />
                      Lida
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(m.id)}
                    className={`flex items-center gap-1.5 transition-colors text-sm px-3 py-1.5 rounded-lg ${
                      confirmDelete === m.id
                        ? 'text-red-400 bg-red-500/20 hover:bg-red-500/30'
                        : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                    }`}
                  >
                    <Trash2 size={14} />
                    {confirmDelete === m.id ? 'Confirmar?' : 'Excluir'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
