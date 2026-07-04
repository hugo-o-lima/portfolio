import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './i18n/LanguageContext';
import { ContentProvider } from './content/ContentContext';

/**
 * Renderiza a aplicação em HTML estático no momento do build (SSG).
 * Sem janela/backend disponíveis, os contextos caem nos valores padrão
 * (defaultContent + idioma pt-BR), o que é exatamente o que queremos que
 * crawlers e previews de redes sociais enxerguem.
 */
export function render(url = '/'): string {
  return renderToString(
    <StaticRouter location={url}>
      <LanguageProvider>
        <ContentProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ContentProvider>
      </LanguageProvider>
    </StaticRouter>,
  );
}
