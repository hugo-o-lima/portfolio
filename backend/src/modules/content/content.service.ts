import { pool } from '../../db/client';
import {
  defaultContent,
  contentSections,
  langs,
  type SiteContent,
  type ContentSection,
  type Lang,
} from './content.defaults';

const keyFor = (lang: Lang, section: ContentSection) => `content_${lang}_${section}`;

// Returns the full site content per language: stored overrides merged on top of defaults.
export async function getContent(): Promise<Record<Lang, SiteContent>> {
  const allKeys = langs.flatMap((lang) => contentSections.map((s) => keyFor(lang, s)));
  const { rows } = await pool.query<{ key: string; value: string }>(
    `SELECT key, value FROM app_settings WHERE key = ANY($1)`,
    [allKeys]
  );

  const stored = new Map(rows.map((r) => [r.key, r.value]));
  const result = {} as Record<Lang, SiteContent>;

  for (const lang of langs) {
    const langResult = {} as SiteContent;
    for (const section of contentSections) {
      const raw = stored.get(keyFor(lang, section));
      let override: unknown = undefined;
      if (raw) {
        try {
          override = JSON.parse(raw);
        } catch {
          override = undefined;
        }
      }
      // Shallow merge: a stored section fully replaces the default section's fields it provides.
      langResult[section] = {
        ...(defaultContent[lang][section] as object),
        ...(typeof override === 'object' && override ? (override as object) : {}),
      } as never;
    }
    result[lang] = langResult;
  }

  return result;
}

export async function setSection(
  lang: Lang,
  section: ContentSection,
  value: unknown
): Promise<unknown> {
  const json = JSON.stringify(value);
  await pool.query(
    `INSERT INTO app_settings (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [keyFor(lang, section), json]
  );
  return value;
}
