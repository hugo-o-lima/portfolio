import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useContent } from '../../content/useContent';
import { defaultContent, langs, type SiteContent, type ContentSection, type Lang } from '../../content/types';
import {
  LogOut, Plus, Trash2, Check, ChevronDown, Save,
  User, Home as HomeIcon, Briefcase, Mail, Languages,
} from 'lucide-react';

const inputClass =
  'w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors text-sm';

const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5';

/* ---------- small reusable field helpers ---------- */

function Field({
  label, value, onChange, placeholder, textarea, hint, type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
  hint?: string;
  type?: string;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={`${inputClass} resize-y`}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
          placeholder={placeholder}
        />
      )}
      {hint && <p className="text-gray-500 text-xs mt-1">{hint}</p>}
    </div>
  );
}

/** Editor for a list of plain strings (typewriter, skills, bio paragraphs, tags). */
function StringListEditor({
  label, items, onChange, placeholder, textarea, addLabel,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  textarea?: boolean;
  addLabel: string;
}) {
  const update = (i: number, v: string) => onChange(items.map((it, idx) => (idx === i ? v : it)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, '']);

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-start">
            {textarea ? (
              <textarea
                value={item}
                onChange={(e) => update(i, e.target.value)}
                rows={2}
                className={`${inputClass} resize-y`}
                placeholder={placeholder}
              />
            ) : (
              <input
                value={item}
                onChange={(e) => update(i, e.target.value)}
                className={inputClass}
                placeholder={placeholder}
              />
            )}
            <button
              type="button"
              onClick={() => remove(i)}
              className="shrink-0 p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              aria-label="Remover"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-2 flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
      >
        <Plus size={15} /> {addLabel}
      </button>
    </div>
  );
}

/* ---------- collapsible section wrapper ---------- */

function SectionCard({
  icon: Icon, title, section, open, onToggle, onSave, savedAt, saving, children,
}: {
  icon: typeof HomeIcon;
  title: string;
  section: ContentSection;
  open: boolean;
  onToggle: () => void;
  onSave: (s: ContentSection) => void;
  savedAt: ContentSection | null;
  saving: ContentSection | null;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-700/40 transition-colors"
      >
        <span className="flex items-center gap-3 text-white font-semibold">
          <span className="w-9 h-9 flex items-center justify-center bg-blue-500/15 border border-blue-500/30 rounded-lg">
            <Icon className="text-blue-400" size={18} />
          </span>
          {title}
        </span>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="px-6 pb-6 pt-2 space-y-4 border-t border-gray-700/60">
          {children}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onSave(section)}
              disabled={saving === section}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
            >
              {saving === section ? (
                <>Salvando...</>
              ) : (
                <><Save size={15} /> Salvar seção</>
              )}
            </button>
            {savedAt === section && (
              <span className="flex items-center gap-1.5 text-green-400 text-sm">
                <Check size={15} /> Salvo!
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- page ---------- */

export default function AdminContent() {
  const { accessToken, admin, logout } = useAuth();
  const { refresh } = useContent();
  const navigate = useNavigate();
  const location = useLocation();

  const [editLang, setEditLang] = useState<Lang>('pt');
  const [drafts, setDrafts] = useState<Record<Lang, SiteContent>>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [openSection, setOpenSection] = useState<ContentSection | null>('home');
  const [saving, setSaving] = useState<ContentSection | null>(null);
  const [savedAt, setSavedAt] = useState<ContentSection | null>(null);
  const [translating, setTranslating] = useState(false);
  const [translateMsg, setTranslateMsg] = useState('');
  const [error, setError] = useState('');
  // Snapshot do PT já traduzido para EN (ou carregado). Se o PT atual for igual,
  // não há nada novo para traduzir e o botão fica desabilitado.
  const [ptBaseline, setPtBaseline] = useState('');

  // The section being edited for the currently selected language.
  const draft = drafts[editLang];

  // Há conteúdo PT novo/alterado desde a última tradução?
  const hasUntranslatedChanges = JSON.stringify(drafts.pt) !== ptBaseline;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/content');
      const data = await res.json();
      if (data?.content) {
        const next = {} as Record<Lang, SiteContent>;
        for (const l of langs) {
          const c = data.content[l] ?? {};
          next[l] = {
            home: { ...defaultContent[l].home, ...c.home },
            about: { ...defaultContent[l].about, ...c.about },
            services: { ...defaultContent[l].services, ...c.services },
            contact: { ...defaultContent[l].contact, ...c.contact },
          };
        }
        setDrafts(next);
        // O EN persistido reflete o PT atual no carregamento → baseline = PT carregado.
        setPtBaseline(JSON.stringify(next.pt));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Patch a single section of the draft for the currently selected language.
  function patch<K extends ContentSection>(section: K, value: Partial<SiteContent[K]>) {
    setDrafts((all) => ({
      ...all,
      [editLang]: { ...all[editLang], [section]: { ...all[editLang][section], ...value } },
    }));
  }

  async function saveSection(section: ContentSection) {
    if (!accessToken) return;
    setSaving(section);
    setError('');
    try {
      const res = await fetch(`/api/content/${editLang}/${section}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(drafts[editLang][section]),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Erro ao salvar. Verifique os campos.');
        return;
      }
      await refresh(); // update the live public site immediately
      setSavedAt(section);
      setTimeout(() => setSavedAt((s) => (s === section ? null : s)), 2500);
    } catch {
      setError('Erro de conexão');
    } finally {
      setSaving(null);
    }
  }

  // Auto-translate everything typed in Portuguese into English (translate + save).
  async function translatePtToEn() {
    if (!accessToken || translating || !hasUntranslatedChanges) return;
    setTranslating(true);
    setError('');
    setTranslateMsg('');
    const ptSnapshot = JSON.stringify(drafts.pt);
    const sections: ContentSection[] = ['home', 'about', 'services', 'contact'];
    try {
      const translated = {} as SiteContent;
      for (const section of sections) {
        const res = await fetch(`/api/content/translate/pt/en/${section}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify(drafts.pt[section]),
        });
        if (!res.ok) {
          setError('Não foi possível traduzir agora. Tente novamente em instantes.');
          return;
        }
        const data = await res.json();
        translated[section] = data.value;
        // Persist the translated section so the English site updates immediately.
        await fetch(`/api/content/en/${section}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify(data.value),
        });
      }
      setDrafts((all) => ({ ...all, en: translated }));
      setPtBaseline(ptSnapshot); // PT atual agora está refletido no EN
      await refresh();
      setEditLang('en');
      setTranslateMsg('Conteúdo traduzido para inglês e salvo. Revise os campos abaixo se quiser ajustar.');
      setTimeout(() => setTranslateMsg(''), 6000);
    } catch {
      setError('Erro de conexão durante a tradução.');
    } finally {
      setTranslating(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/admin', { replace: true });
  }

  const toggle = (s: ContentSection) => setOpenSection((cur) => (cur === s ? null : s));

  const tabs = [
    { label: 'Projetos', path: '/admin/dashboard' },
    { label: 'Conteúdo', path: '/admin/content' },
    { label: 'Mensagens', path: '/admin/messages' },
    { label: 'Status do Servidor', path: '/admin/status' },
            { label: 'Usuários', path: '/admin/users' },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">
              <span className="text-blue-400">&lt;</span>hugo-antonio<span className="text-blue-400">/&gt;</span>
            </h1>
            <p className="text-gray-400 text-xs mt-0.5">{admin?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </header>

      <div className="bg-gray-800 border-b border-gray-700 px-6">
        <div className="max-w-6xl mx-auto flex gap-1">
          {tabs.map(({ label, path }) => {
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

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Conteúdo do site</h2>
          <div className="w-12 h-1 bg-blue-500 mt-2 rounded-full" />
          <p className="text-gray-400 text-sm mt-3">
            Edite os textos e informações da página principal. As alterações aparecem no site assim que você salva.
          </p>
        </div>

        {/* Language selector — content is edited separately per language */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-400">Idioma sendo editado:</span>
          <div className="inline-flex bg-gray-800 border border-gray-700 rounded-lg p-1">
            {([
              { code: 'pt' as Lang, label: '🇧🇷 Português' },
              { code: 'en' as Lang, label: '🇺🇸 English' },
            ]).map(({ code, label }) => (
              <button
                key={code}
                type="button"
                onClick={() => { setEditLang(code); setSavedAt(null); }}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  editLang === code
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={translatePtToEn}
            disabled={translating || !hasUntranslatedChanges}
            title={
              hasUntranslatedChanges
                ? 'Traduz automaticamente todo o conteúdo digitado em português para inglês'
                : 'Nada novo para traduzir — edite o conteúdo em português primeiro'
            }
            className="ml-auto flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
          >
            <Languages size={16} />
            {translating
              ? 'Traduzindo...'
              : hasUntranslatedChanges
                ? 'Traduzir PT → EN automaticamente'
                : 'Tradução em dia'}
          </button>
        </div>

        {translateMsg && (
          <p className="text-emerald-400 text-sm bg-emerald-900/20 border border-emerald-500/30 rounded-lg px-4 py-2 mb-4 flex items-center gap-2">
            <Check size={15} /> {translateMsg}
          </p>
        )}

        {error && (
          <p className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg px-4 py-2 mb-4">
            {error}
          </p>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-800 rounded-2xl h-16 animate-pulse border border-gray-700" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* HOME */}
            <SectionCard
              icon={HomeIcon} title="Início (Home)" section="home"
              open={openSection === 'home'} onToggle={() => toggle('home')}
              onSave={saveSection} savedAt={savedAt} saving={saving}
            >
              <Field label="Badge (selo de disponibilidade)" value={draft.home.badge}
                onChange={(v) => patch('home', { badge: v })}
                placeholder="Disponível para novos projetos" />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Saudação" value={draft.home.greeting}
                  onChange={(v) => patch('home', { greeting: v })} placeholder="Olá, eu sou" />
                <Field label="Nome (destaque)" value={draft.home.name}
                  onChange={(v) => patch('home', { name: v })} placeholder="Hugo Antonio" />
              </div>
              <StringListEditor label="Frases do efeito de digitação" items={draft.home.typewriter}
                onChange={(items) => patch('home', { typewriter: items })}
                placeholder="Desenvolvedor Full-Stack" addLabel="Adicionar frase" />
              <Field label="Subtítulo" value={draft.home.subtitle} textarea
                onChange={(v) => patch('home', { subtitle: v })}
                placeholder="Criando experiências digitais..." />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="URL do GitHub" value={draft.home.githubUrl}
                  onChange={(v) => patch('home', { githubUrl: v })} placeholder="https://github.com/..." />
                <Field label="URL do LinkedIn" value={draft.home.linkedinUrl}
                  onChange={(v) => patch('home', { linkedinUrl: v })} placeholder="https://linkedin.com/in/..." />
              </div>
            </SectionCard>

            {/* ABOUT */}
            <SectionCard
              icon={User} title="Sobre mim" section="about"
              open={openSection === 'about'} onToggle={() => toggle('about')}
              onSave={saveSection} savedAt={savedAt} saving={saving}
            >
              <div>
                <label className={labelClass}>Informações pessoais</label>
                <div className="space-y-2">
                  {draft.about.personalInfo.map((info, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <input
                        value={info.label}
                        onChange={(e) => patch('about', {
                          personalInfo: draft.about.personalInfo.map((it, idx) =>
                            idx === i ? { ...it, label: e.target.value } : it),
                        })}
                        className={`${inputClass} max-w-[35%]`}
                        placeholder="Rótulo (ex: Idade)"
                      />
                      <input
                        value={info.value}
                        onChange={(e) => patch('about', {
                          personalInfo: draft.about.personalInfo.map((it, idx) =>
                            idx === i ? { ...it, value: e.target.value } : it),
                        })}
                        className={inputClass}
                        placeholder="Valor (ex: 18 anos)"
                      />
                      <button
                        type="button"
                        onClick={() => patch('about', {
                          personalInfo: draft.about.personalInfo.filter((_, idx) => idx !== i),
                        })}
                        className="shrink-0 p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        aria-label="Remover"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => patch('about', {
                    personalInfo: [...draft.about.personalInfo, { label: '', value: '' }],
                  })}
                  className="mt-2 flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Plus size={15} /> Adicionar informação
                </button>
              </div>

              <StringListEditor label="Biografia (parágrafos)" items={draft.about.bioParagraphs}
                onChange={(items) => patch('about', { bioParagraphs: items })} textarea
                placeholder="Escreva um parágrafo..." addLabel="Adicionar parágrafo" />

              <StringListEditor label="Habilidades / Tecnologias" items={draft.about.skills}
                onChange={(items) => patch('about', { skills: items })}
                placeholder="JavaScript" addLabel="Adicionar habilidade" />

              <div>
                <label className={labelClass}>Hobbies & Interesses</label>
                <div className="space-y-2">
                  {draft.about.hobbies.map((hobby, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <input
                        value={hobby.icon}
                        onChange={(e) => patch('about', {
                          hobbies: draft.about.hobbies.map((it, idx) =>
                            idx === i ? { ...it, icon: e.target.value } : it),
                        })}
                        className={`${inputClass} max-w-[80px] text-center`}
                        placeholder="🎮"
                      />
                      <input
                        value={hobby.name}
                        onChange={(e) => patch('about', {
                          hobbies: draft.about.hobbies.map((it, idx) =>
                            idx === i ? { ...it, name: e.target.value } : it),
                        })}
                        className={inputClass}
                        placeholder="Games"
                      />
                      <button
                        type="button"
                        onClick={() => patch('about', {
                          hobbies: draft.about.hobbies.filter((_, idx) => idx !== i),
                        })}
                        className="shrink-0 p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        aria-label="Remover"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => patch('about', {
                    hobbies: [...draft.about.hobbies, { icon: '', name: '' }],
                  })}
                  className="mt-2 flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Plus size={15} /> Adicionar hobby
                </button>
                <p className="text-gray-500 text-xs mt-1">Dica: cole um emoji no primeiro campo.</p>
              </div>
            </SectionCard>

            {/* SERVICES */}
            <SectionCard
              icon={Briefcase} title="Serviços" section="services"
              open={openSection === 'services'} onToggle={() => toggle('services')}
              onSave={saveSection} savedAt={savedAt} saving={saving}
            >
              <div className="space-y-4">
                {draft.services.items.map((item, i) => (
                  <div key={i} className="bg-gray-900 rounded-xl border border-gray-700 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-xs font-medium">Serviço {i + 1}</span>
                      <button
                        type="button"
                        onClick={() => patch('services', {
                          items: draft.services.items.filter((_, idx) => idx !== i),
                        })}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        aria-label="Remover serviço"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Ícone</label>
                        <select
                          value={item.icon}
                          onChange={(e) => patch('services', {
                            items: draft.services.items.map((it, idx) =>
                              idx === i ? { ...it, icon: e.target.value } : it),
                          })}
                          className={inputClass}
                        >
                          <option value="code">Código (front-end)</option>
                          <option value="server">Servidor (back-end)</option>
                          <option value="database">Banco de dados</option>
                        </select>
                      </div>
                      <Field label="Título" value={item.title}
                        onChange={(v) => patch('services', {
                          items: draft.services.items.map((it, idx) =>
                            idx === i ? { ...it, title: v } : it),
                        })}
                        placeholder="Front-end Moderno" />
                    </div>
                    <Field label="Descrição" value={item.description} textarea
                      onChange={(v) => patch('services', {
                        items: draft.services.items.map((it, idx) =>
                          idx === i ? { ...it, description: v } : it),
                      })}
                      placeholder="Descreva o serviço..." />
                    <StringListEditor label="Tags" items={item.tags}
                      onChange={(tags) => patch('services', {
                        items: draft.services.items.map((it, idx) =>
                          idx === i ? { ...it, tags } : it),
                      })}
                      placeholder="React" addLabel="Adicionar tag" />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => patch('services', {
                  items: [...draft.services.items, { icon: 'code', title: '', description: '', tags: [] }],
                })}
                className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Plus size={15} /> Adicionar serviço
              </button>
            </SectionCard>

            {/* CONTACT */}
            <SectionCard
              icon={Mail} title="Contato" section="contact"
              open={openSection === 'contact'} onToggle={() => toggle('contact')}
              onSave={saveSection} savedAt={savedAt} saving={saving}
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="E-mail" value={draft.contact.email} type="email"
                  onChange={(v) => patch('contact', { email: v })} placeholder="voce@email.com" />
                <Field label="Localização" value={draft.contact.location}
                  onChange={(v) => patch('contact', { location: v })} placeholder="Maringá, Brasil" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Telefone (exibido)" value={draft.contact.phone}
                  onChange={(v) => patch('contact', { phone: v })} placeholder="+55 (67) 99999-9999" />
                <Field label="Telefone (link tel:)" value={draft.contact.phoneHref}
                  onChange={(v) => patch('contact', { phoneHref: v })}
                  placeholder="tel:+5567999999999" hint="Formato: tel:+55..." />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="URL do GitHub" value={draft.contact.githubUrl}
                  onChange={(v) => patch('contact', { githubUrl: v })} placeholder="https://github.com/..." />
                <Field label="URL do LinkedIn" value={draft.contact.linkedinUrl}
                  onChange={(v) => patch('contact', { linkedinUrl: v })} placeholder="https://linkedin.com/in/..." />
              </div>
            </SectionCard>
          </div>
        )}
      </main>
    </div>
  );
}
