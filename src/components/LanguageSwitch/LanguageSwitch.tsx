import { useLanguage } from '../../i18n/useLanguage';
import { LANGS, type Lang } from '../../i18n/translations';

/* Switch deslizante PT | EN. O indicador desliza para o idioma ativo. */
export default function LanguageSwitch({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useLanguage();

  return (
    <div
      role="radiogroup"
      aria-label={t.header.switchTo}
      title={t.header.switchTo}
      className={`relative inline-flex items-center rounded-full border border-gray-700 bg-gray-800/60 p-0.5 font-mono text-xs font-semibold ${className}`}
    >
      {/* Indicador deslizante */}
      <span
        aria-hidden="true"
        className={`absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-blue-500 shadow-sm shadow-blue-500/30 transition-transform duration-300 ease-out ${
          lang === 'en' ? 'translate-x-full' : 'translate-x-0'
        }`}
      />
      {(LANGS as readonly Lang[]).map((code) => {
        const active = lang === code;
        return (
          <button
            key={code}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setLang(code)}
            className={`relative z-10 w-9 rounded-full py-1 transition-colors duration-300 ${
              active ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
