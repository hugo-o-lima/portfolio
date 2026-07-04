import React, { createContext, useEffect, useState, useCallback } from 'react';
import { defaultContent, langs, type SiteContent, type Lang } from './types';
import { useLanguage } from '../i18n/useLanguage';

type AllContent = Record<Lang, SiteContent>;

interface ContentContextValue {
  /** Content for the currently active language (used by the public site). */
  content: SiteContent;
  /** Content for every language (used by the admin editor). */
  allContent: AllContent;
  loading: boolean;
  /** Re-fetch content from the backend (used after admin edits). */
  refresh: () => Promise<void>;
}

export const ContentContext = createContext<ContentContextValue | undefined>(undefined);

function mergeLang(stored: Partial<SiteContent> | undefined, lang: Lang): SiteContent {
  const d = defaultContent[lang];
  const s = stored ?? {};
  return {
    home: { ...d.home, ...s.home },
    about: { ...d.about, ...s.about },
    services: { ...d.services, ...s.services },
    contact: { ...d.contact, ...s.contact },
  };
}

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const { lang } = useLanguage();
  const [allContent, setAllContent] = useState<AllContent>(defaultContent);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/content');
      if (!res.ok) return;
      const data = await res.json();
      if (data?.content) {
        const merged = {} as AllContent;
        for (const l of langs) {
          merged[l] = mergeLang(data.content[l], l);
        }
        setAllContent(merged);
      }
    } catch {
      // Keep defaults on network error — the site always renders.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <ContentContext.Provider
      value={{ content: allContent[lang], allContent, loading, refresh }}
    >
      {children}
    </ContentContext.Provider>
  );
}
