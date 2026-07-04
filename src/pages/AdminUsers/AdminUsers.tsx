import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { LogOut, Plus, Trash2, KeyRound, Mail, Calendar, X, Check, UserCircle } from 'lucide-react';

interface User {
  id: string;
  email: string;
  created_at: string;
}

const ADMIN_TABS = [
  { label: 'Projetos', path: '/admin/dashboard' },
  { label: 'Conteúdo', path: '/admin/content' },
  { label: 'Mensagens', path: '/admin/messages' },
  { label: 'Status do Servidor', path: '/admin/status' },
  { label: 'Usuários', path: '/admin/users' },
];

const MIN_PASSWORD = 12;

export default function AdminUsers() {
  const { accessToken, admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Novo usuário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);

  // Troca de senha (id do usuário em edição)
  const [pwEditing, setPwEditing] = useState<string | null>(null);
  const [pwValue, setPwValue] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  const authHeaders = useCallback(
    () => ({ Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }),
    [accessToken]
  );

  const fetchUsers = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch('/api/users', { headers: { Authorization: `Bearer ${accessToken}` } });
      if (res.ok) {
        const d = await res.json();
        setUsers(d.users ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const trimmed = email.trim();
    if (!trimmed || password.length < MIN_PASSWORD) {
      setError(`Informe um e-mail válido e uma senha com ao menos ${MIN_PASSWORD} caracteres.`);
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ email: trimmed, password }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(d.error ?? 'Não foi possível criar o usuário.');
        return;
      }
      setEmail('');
      setPassword('');
      await fetchUsers();
    } catch {
      setError('Erro de conexão.');
    } finally {
      setCreating(false);
    }
  }

  async function handleChangePassword(id: string) {
    setError('');
    if (pwValue.length < MIN_PASSWORD) {
      setError(`A nova senha deve ter ao menos ${MIN_PASSWORD} caracteres.`);
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch(`/api/users/${id}/password`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ password: pwValue }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? 'Não foi possível alterar a senha.');
        return;
      }
      setPwEditing(null);
      setPwValue('');
    } catch {
      setError('Erro de conexão.');
    } finally {
      setPwSaving(false);
    }
  }

  async function handleDelete(u: User) {
    setError('');
    if (!window.confirm(`Excluir o usuário ${u.email}? Esta ação não pode ser desfeita.`)) return;
    try {
      const res = await fetch(`/api/users/${u.id}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok && res.status !== 204) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? 'Não foi possível excluir o usuário.');
        return;
      }
      await fetchUsers();
    } catch {
      setError('Erro de conexão.');
    }
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
          {ADMIN_TABS.map(({ label, path }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  active ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'
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
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Usuários</h2>
          <div className="w-12 h-1 bg-blue-500 mt-2 rounded-full" />
          <p className="text-gray-500 text-sm mt-2">Contas com acesso ao painel administrativo.</p>
        </div>

        {error && (
          <div className="text-sm mb-4 px-4 py-2 rounded-lg border bg-red-500/10 text-red-400 border-red-500/30">
            {error}
          </div>
        )}

        {/* Novo usuário */}
        <form
          onSubmit={handleCreate}
          className="bg-gray-800 rounded-2xl p-5 border border-gray-700 mb-6"
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
            <Plus size={14} />
            Novo usuário
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              autoComplete="off"
              className="bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-blue-500"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={`Senha (mín. ${MIN_PASSWORD} caracteres)`}
              autoComplete="new-password"
              className="bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={creating}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
            >
              <Plus size={16} />
              {creating ? 'Criando...' : 'Adicionar'}
            </button>
          </div>
        </form>

        {/* Lista */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse border border-gray-700" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <p className="text-gray-500 text-center py-10">Nenhum usuário cadastrado.</p>
        ) : (
          <div className="space-y-3">
            {users.map((u) => {
              const isSelf = u.id === admin?.id;
              return (
                <div
                  key={u.id}
                  className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex flex-wrap items-center gap-4"
                >
                  <UserCircle size={20} className="text-blue-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium flex items-center gap-2 truncate">
                      <Mail size={14} className="text-gray-500 shrink-0" />
                      {u.email}
                      {isSelf && (
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                          você
                        </span>
                      )}
                    </p>
                    <p className="text-gray-500 text-xs flex items-center gap-1.5 mt-1">
                      <Calendar size={12} />
                      Criado em {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  {pwEditing === u.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        value={pwValue}
                        onChange={(e) => setPwValue(e.target.value)}
                        placeholder={`Nova senha (mín. ${MIN_PASSWORD})`}
                        autoComplete="new-password"
                        className="bg-gray-900 border border-blue-500/60 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-400 w-56"
                      />
                      <button
                        onClick={() => handleChangePassword(u.id)}
                        disabled={pwSaving}
                        className="text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
                        title="Salvar nova senha"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => { setPwEditing(null); setPwValue(''); }}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Cancelar"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setPwEditing(u.id); setPwValue(''); setError(''); }}
                        className="flex items-center gap-1.5 text-gray-400 hover:text-blue-400 transition-colors text-sm px-3 py-2 rounded-lg hover:bg-gray-700"
                        title="Alterar senha"
                      >
                        <KeyRound size={15} />
                        Senha
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        disabled={isSelf}
                        className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 transition-colors text-sm px-3 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:hover:bg-transparent"
                        title={isSelf ? 'Você não pode excluir a própria conta' : 'Excluir usuário'}
                      >
                        <Trash2 size={15} />
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
