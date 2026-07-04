import { env } from '../../config/env';
import type {
  Lang,
  ContentSection,
  HomeContent,
  AboutContent,
  ServicesContent,
  ContactContent,
} from './content.defaults';

// Free translation via MyMemory (no API key required). An optional contact email
// raises the anonymous daily quota. Falls back to the original text on any error.
async function translateText(text: string, from: Lang, to: Lang): Promise<string> {
  if (!text || !text.trim() || from === to) return text;
  const params = new URLSearchParams({ q: text, langpair: `${from}|${to}` });
  if (env.TRANSLATE_EMAIL) params.set('de', env.TRANSLATE_EMAIL);
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?${params.toString()}`);
    if (!res.ok) return text;
    const data = (await res.json()) as { responseData?: { translatedText?: string } };
    const out = data?.responseData?.translatedText;
    return typeof out === 'string' && out.trim() ? out : text;
  } catch {
    return text;
  }
}

const translateAll = (texts: string[], from: Lang, to: Lang) =>
  Promise.all(texts.map((t) => translateText(t, from, to)));

// Translates only the human-readable fields of a section. Neutral fields
// (URLs, icons, email, phone, tech tags/skills, proper name) are left untouched.
export async function translateSection(
  section: ContentSection,
  value: unknown,
  from: Lang,
  to: Lang
): Promise<unknown> {
  switch (section) {
    case 'home': {
      const v = value as HomeContent;
      const [badge, greeting, subtitle] = await translateAll([v.badge, v.greeting, v.subtitle], from, to);
      const typewriter = await translateAll(v.typewriter, from, to);
      return { ...v, badge, greeting, subtitle, typewriter };
    }
    case 'about': {
      const v = value as AboutContent;
      const personalInfo = await Promise.all(
        v.personalInfo.map(async (p) => ({
          label: await translateText(p.label, from, to),
          value: await translateText(p.value, from, to),
        }))
      );
      const bioParagraphs = await translateAll(v.bioParagraphs, from, to);
      const hobbies = await Promise.all(
        v.hobbies.map(async (h) => ({ icon: h.icon, name: await translateText(h.name, from, to) }))
      );
      return { ...v, personalInfo, bioParagraphs, hobbies }; // skills kept (tech terms)
    }
    case 'services': {
      const v = value as ServicesContent;
      const items = await Promise.all(
        v.items.map(async (it) => ({
          ...it, // icon + tags kept
          title: await translateText(it.title, from, to),
          description: await translateText(it.description, from, to),
        }))
      );
      return { ...v, items };
    }
    case 'contact': {
      const v = value as ContactContent;
      return { ...v, location: await translateText(v.location, from, to) };
    }
    default:
      return value;
  }
}
