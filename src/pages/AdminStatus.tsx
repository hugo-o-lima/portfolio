import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { LogOut, Server, X, Users, Wifi, Info, Pencil, Check, RefreshCw, Clock, Play, Square, Terminal, Power } from 'lucide-react';

interface StatusData {
  minecraft: {
    processRunning: boolean;
    online: boolean;
  };
}

const GRAFANA_BASE = '/grafana';
const DASHBOARD_UID = 'server-stats';

function grafanaPanelUrl(panelId: number): string {
  return `${GRAFANA_BASE}/d-solo/${DASHBOARD_UID}/${DASHBOARD_UID}?orgId=1&panelId=${panelId}&theme=dark&refresh=30s`;
}

interface MinecraftDetails {
  processRunning: boolean;
  online: boolean;
  uptimeSeconds: number | null;
  players: { online: number; max: number; names: string[] } | null;
  version: string | null;
  motd: string | null;
  latency: number | null;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function GrafanaCard({ panelId, title, reloadKey = 0 }: { panelId: number; title: string; reloadKey?: number }) {
  // `key` força o React a recriar o iframe a cada refresh manual, recarregando o painel.
  return (
    <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700" style={{ height: 200 }}>
      <iframe
        key={reloadKey}
        src={`${grafanaPanelUrl(panelId)}&_r=${reloadKey}`}
        width="100%"
        height="200"
        frameBorder="0"
        title={title}
        loading="lazy"
      />
    </div>
  );
}

function SkeletonCard({ wide }: { wide?: boolean }) {
  return (
    <div className={`bg-gray-800 rounded-2xl p-5 animate-pulse border border-gray-700 ${wide ? 'md:col-span-2' : ''}`}>
      <div className="h-4 bg-gray-700 rounded w-1/3 mb-4" />
      <div className="h-7 bg-gray-700 rounded w-1/2 mb-3" />
      <div className="h-2 bg-gray-700 rounded-full w-full" />
    </div>
  );
}

function McBadge({ state }: { state: 'online' | 'starting' | 'offline' }) {
  const config = {
    online:   { label: 'Online',    cls: 'bg-green-500/20 text-green-400 border-green-500/30',  dot: 'bg-green-400 animate-pulse' },
    starting: { label: 'Iniciando', cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-400 animate-pulse' },
    offline:  { label: 'Offline',   cls: 'bg-red-500/20 text-red-400 border-red-500/30',       dot: 'bg-red-400' },
  }[state];
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full font-medium border ${config.cls}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

// ─── Minecraft Details Modal ──────────────────────────────────────────────────

function MinecraftModal({
  accessToken,
  mcState,
  onClose,
}: {
  accessToken: string;
  mcState: 'online' | 'starting' | 'offline';
  onClose: () => void;
}) {
  const [details, setDetails] = useState<MinecraftDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/status/minecraft', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) setDetails(await res.json());
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchDetails();
    // Auto-refresh every 10s while modal is open
    const t = setInterval(fetchDetails, 10000);
    return () => clearInterval(t);
  }, [fetchDetails]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Server size={18} className="text-blue-400" />
            <h3 className="text-white font-semibold">Servidor Minecraft</h3>
            <McBadge state={mcState} />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Modal body */}
        <div className="px-6 py-5 space-y-4">
          {loading && !details ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-gray-700 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : details ? (
            <>
              {/* Players */}
              <div className="bg-gray-900/60 rounded-xl p-4 flex items-center gap-3">
                <Users size={16} className="text-blue-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">Jogadores</p>
                  {details.players ? (
                    <>
                      <p className="text-white font-semibold">
                        {details.players.online} / {details.players.max}
                      </p>
                      {details.players.names.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {details.players.names.map((name) => (
                            <span key={name} className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full border border-blue-500/30">
                              {name}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500 text-sm">Servidor offline</p>
                  )}
                </div>
              </div>

              {/* Runtime */}
              <div className="bg-gray-900/60 rounded-xl p-4 flex items-center gap-3">
                <Clock size={16} className="text-blue-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Tempo online</p>
                  <p className="text-white font-semibold">
                    {details.uptimeSeconds != null ? formatUptime(details.uptimeSeconds) : '—'}
                  </p>
                </div>
              </div>

              {/* Version + Latency */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-900/60 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-0.5">Versão</p>
                  <p className="text-white font-semibold text-sm">{details.version ?? '—'}</p>
                </div>
                <div className="bg-gray-900/60 rounded-xl p-4 flex items-center gap-2">
                  <Wifi size={14} className={details.latency != null ? 'text-green-400' : 'text-gray-500'} />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Ping</p>
                    <p className="text-white font-semibold text-sm">
                      {details.latency != null ? `${details.latency} ms` : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* MOTD */}
              {details.motd && (
                <div className="bg-gray-900/60 rounded-xl p-4 flex items-start gap-3">
                  <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">MOTD</p>
                    <p className="text-gray-300 text-sm">{details.motd}</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-center py-4">Erro ao carregar detalhes.</p>
          )}
        </div>

        <div className="px-6 pb-4 flex items-center justify-between">
          <button
            onClick={fetchDetails}
            disabled={loading}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs transition-colors"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
          <span className="text-gray-600 text-xs">/home/minecraftserver/server/ · :25565</span>
        </div>
      </div>
    </div>
  );
}

// ─── Server control + live console ────────────────────────────────────────────

function ServerControl({
  accessToken,
  mcState,
  onChanged,
}: {
  accessToken: string;
  mcState: 'online' | 'starting' | 'offline';
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState<'start' | 'stop' | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [showConsole, setShowConsole] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const termRef = useRef<HTMLDivElement>(null);

  const running = mcState !== 'offline';

  async function control(action: 'start' | 'stop') {
    if (action === 'stop' && !window.confirm('Desligar o servidor de Minecraft? Os jogadores conectados serão desconectados.')) return;
    setBusy(action);
    setFeedback(null);
    try {
      const res = await fetch(`/api/status/minecraft/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const d = await res.json().catch(() => ({}));
      setFeedback({ ok: res.ok, msg: d.message ?? (res.ok ? 'Comando enviado.' : 'Falha ao executar o comando.') });
      setShowConsole(true); // revela o console para acompanhar
      setTimeout(onChanged, 1500); // atualiza o status logo em seguida
    } catch {
      setFeedback({ ok: false, msg: 'Erro de conexão com o servidor.' });
    } finally {
      setBusy(null);
    }
  }

  // Stream de logs ao vivo via SSE (EventSource não envia headers → token na query)
  useEffect(() => {
    if (!showConsole || !accessToken) return;
    const es = new EventSource(`/api/status/minecraft/logs?token=${encodeURIComponent(accessToken)}`);
    es.onopen = () => setConnected(true);
    es.onmessage = (e) => setLines((prev) => [...prev.slice(-499), e.data]);
    es.onerror = () => setConnected(false);
    return () => {
      es.close();
      setConnected(false);
    };
  }, [showConsole, accessToken]);

  // Auto-scroll para o final a cada nova linha
  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [lines]);

  return (
    <div className="md:col-span-2 bg-gray-800 rounded-2xl p-5 border border-gray-700">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Power size={14} />
          Controle do Servidor
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => control('start')}
            disabled={busy !== null || running}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {busy === 'start' ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
            Ligar
          </button>
          <button
            onClick={() => control('stop')}
            disabled={busy !== null || !running}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {busy === 'stop' ? <RefreshCw size={14} className="animate-spin" /> : <Square size={14} />}
            Desligar
          </button>
          <button
            onClick={() => setShowConsole((s) => !s)}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors border ${
              showConsole
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-gray-600 text-gray-400 hover:text-white hover:border-gray-500'
            }`}
          >
            <Terminal size={14} />
            Console
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`text-sm mb-3 px-3 py-2 rounded-lg border ${
            feedback.ok
              ? 'bg-green-500/10 text-green-400 border-green-500/30'
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}
        >
          {feedback.msg}
        </div>
      )}

      {showConsole && (
        <div className="rounded-xl overflow-hidden border border-gray-700">
          <div className="flex items-center justify-between bg-gray-900 px-3 py-2 border-b border-gray-700">
            <span className="text-xs text-gray-400 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
              {connected ? 'Conectado · logs ao vivo' : 'Conectando…'}
            </span>
            <button onClick={() => setLines([])} className="text-xs text-gray-500 hover:text-white transition-colors">
              Limpar
            </button>
          </div>
          <div
            ref={termRef}
            className="bg-black/90 text-gray-200 font-mono text-xs leading-relaxed p-3 h-80 overflow-y-auto whitespace-pre-wrap break-words"
          >
            {lines.length === 0 ? (
              <span className="text-gray-600">Aguardando logs…</span>
            ) : (
              lines.map((l, i) => <div key={i}>{l}</div>)
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const DEFAULT_MC_NAME = 'Fabric Minecraft 1.21.x';

export default function AdminStatus() {
  const { accessToken, admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [serverName, setServerName] = useState(DEFAULT_MC_NAME);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Carrega o nome persistido no servidor
  useEffect(() => {
    if (!accessToken) return;
    fetch('/api/status/server-name', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => { if (d?.name) setServerName(d.name); })
      .catch(() => { /* mantém o default em caso de falha */ });
  }, [accessToken]);

  function startEditName(e: React.MouseEvent) {
    e.stopPropagation();
    setNameInput(serverName);
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  }

  async function saveEditName(e: React.MouseEvent) {
    e.stopPropagation();
    const trimmed = nameInput.trim();
    setEditingName(false);
    if (!trimmed || trimmed === serverName || !accessToken) return;

    const previous = serverName;
    setServerName(trimmed); // atualização otimista
    try {
      const res = await fetch('/api/status/server-name', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) throw new Error('save failed');
      const d = await res.json();
      if (d?.name) setServerName(d.name);
    } catch {
      setServerName(previous); // reverte se falhar
    }
  }

  function cancelEditName(e: React.MouseEvent) {
    e.stopPropagation();
    setEditingName(false);
  }

  const fetchStatus = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch('/api/status/minecraft', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const mc = await res.json();
        setData({ minecraft: { processRunning: mc.processRunning, online: mc.online } });
        setLastUpdated(new Date());
        setCountdown(30);
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Refresh manual: re-busca o status E recarrega os painéis do Grafana (iframes).
  const handleManualRefresh = useCallback(() => {
    setReloadKey((k) => k + 1);
    setCountdown(30);
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { fetchStatus(); return 30; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  async function handleLogout() {
    await logout();
    navigate('/admin', { replace: true });
  }

  const mcState: 'online' | 'starting' | 'offline' = data
    ? data.minecraft.online
      ? 'online'
      : data.minecraft.processRunning
        ? 'starting'
        : 'offline'
    : 'offline';

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
        {/* Title + refresh */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Status do Servidor</h2>
            <div className="w-12 h-1 bg-blue-500 mt-2 rounded-full" />
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-gray-500 text-xs hidden sm:block">
                Atualizado às {lastUpdated.toLocaleTimeString('pt-BR')}
              </span>
            )}
            <button
              onClick={handleManualRefresh}
              disabled={loading}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm px-3 py-2 rounded-lg hover:bg-gray-700"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Atualizando...' : `${countdown}s`}
            </button>
          </div>
        </div>

        {loading && !data ? (
          <div className="grid md:grid-cols-2 gap-4">
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
            <SkeletonCard wide />
          </div>
        ) : data ? (
          <div className="grid md:grid-cols-2 gap-4">
            {/* Sistema — painéis Grafana */}
            <GrafanaCard panelId={1} title="CPU" reloadKey={reloadKey} />
            <GrafanaCard panelId={2} title="Memória RAM" reloadKey={reloadKey} />
            <GrafanaCard panelId={3} title="Disco" reloadKey={reloadKey} />
            <GrafanaCard panelId={4} title="Uptime" reloadKey={reloadKey} />

            {/* Minecraft — clickable */}
            <button
              onClick={() => setModalOpen(true)}
              className="md:col-span-2 bg-gray-800 rounded-2xl p-5 border border-gray-700 hover:border-blue-500/50 hover:bg-gray-800/80 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                <Server size={14} />
                Servidor Minecraft
                <span className="ml-auto text-xs text-gray-600 group-hover:text-blue-400 transition-colors flex items-center gap-1">
                  <Info size={12} />
                  Clique para detalhes
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <McBadge state={mcState} />
                  <div className="flex items-center gap-2 mt-2">
                    {editingName ? (
                      <>
                        <input
                          ref={nameInputRef}
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEditName(e as unknown as React.MouseEvent);
                            if (e.key === 'Escape') cancelEditName(e as unknown as React.MouseEvent);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-gray-700 border border-blue-500/60 text-white font-semibold text-lg rounded-lg px-2 py-0.5 outline-none focus:border-blue-400 w-64"
                        />
                        <button onClick={saveEditName} className="text-green-400 hover:text-green-300 transition-colors">
                          <Check size={16} />
                        </button>
                        <button onClick={cancelEditName} className="text-gray-400 hover:text-white transition-colors">
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-white font-semibold text-lg">{serverName}</p>
                        <button
                          onClick={startEditName}
                          className="text-gray-600 hover:text-blue-400 transition-colors md:opacity-0 md:group-hover:opacity-100"
                          title="Editar nome"
                        >
                          <Pencil size={14} />
                        </button>
                      </>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs mt-0.5">/home/minecraftserver/server/ · porta 25565</p>
                </div>
                <div className="text-right text-xs text-gray-500 space-y-1">
                  <p>Processo: <span className={data.minecraft.processRunning ? 'text-green-400' : 'text-red-400'}>{data.minecraft.processRunning ? 'Ativo' : 'Parado'}</span></p>
                  <p>Porta 25565: <span className={data.minecraft.online ? 'text-green-400' : 'text-red-400'}>{data.minecraft.online ? 'Aberta' : 'Fechada'}</span></p>
                </div>
              </div>
            </button>

            {/* Controle do servidor: ligar/desligar + console ao vivo */}
            {accessToken && (
              <ServerControl accessToken={accessToken} mcState={mcState} onChanged={fetchStatus} />
            )}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <p>Erro ao carregar status do servidor.</p>
          </div>
        )}
      </main>

      {modalOpen && accessToken && (
        <MinecraftModal
          accessToken={accessToken}
          mcState={mcState}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
