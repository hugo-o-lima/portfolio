import React, { createContext, useCallback, useEffect, useState } from 'react';
import { LANGS, translations, type Lang, type Translation } from './translations';

export interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: Translation;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'portfolio_lang';

const SEO: Record<Lang, { title: string; description: string; ogLocale: string }> = {
  pt: {
    title: 'Hugo Antonio — Desenvolvedor Full-Stack',
    description:
      'Portfólio de Hugo Antonio, desenvolvedor full-stack e estudante de Ciência da Computação em Maringá. Projetos, habilidades, repositórios e contato.',
    ogLocale: 'pt_BR',
  },
  en: {
    title: 'Hugo Antonio — Full-Stack Developer',
    description:
      'Portfolio of Hugo Antonio, full-stack developer and Computer Science student in Maringá. Projects, skills, repositories and contact.',
    ogLocale: 'en_US',
  },
};

function setMeta(selector: string, content: string) {
  const el = document.head.querySelector<HTMLMetaElement>(selector);
  if (el) el.content = content;
}

function getInitialLang(): Lang {
  if (typeof window === 'undefined') return 'pt';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && (LANGS as readonly string[]).includes(stored)) return stored as Lang;
  // Português é o idioma original do site; só sugerimos inglês se o navegador não for pt.
  const browser = window.navigator.language?.toLowerCase() ?? '';
  return browser.startsWith('pt') ? 'pt' : browser.startsWith('en') ? 'en' : 'pt';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';

    const seo = SEO[lang];
    document.title = seo.title;
    setMeta('meta[name="description"]', seo.description);
    setMeta('meta[property="og:title"]', seo.title);
    setMeta('meta[property="og:description"]', seo.description);
    setMeta('meta[property="og:locale"]', seo.ogLocale);
    setMeta('meta[name="twitter:title"]', seo.title);
    setMeta('meta[name="twitter:description"]', seo.description);
  }, [lang]);

  const setLang = useCallback((next: Lang) => setLangState(next), []);
  const toggleLang = useCallback(() => setLangState((l) => (l === 'pt' ? 'en' : 'pt')), []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}
