import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { LanguageProvider } from './i18n/LanguageContext.tsx';
import { ContentProvider } from './content/ContentContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <ContentProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ContentProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>
);
