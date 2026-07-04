import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import Projects from './components/Projects';
import GitHubRepos from './GitHubRepos';
import Services from './components/Services';
import CustomCursor from './components/CustomCursor';
import BackToTop from './components/BackToTop';
import ScrollProgress from './components/ScrollProgress';
import Reveal from './components/Reveal';
import SectionHeading from './components/SectionHeading';
import NotFound from './pages/NotFound';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { useLanguage } from './i18n/useLanguage';

const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminContent = lazy(() => import('./pages/AdminContent'));
const AdminMessages = lazy(() => import('./pages/AdminMessages'));
const AdminStatus = lazy(() => import('./pages/AdminStatus'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));

function Portfolio() {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'services', 'repos', 'projects', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const height = element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="custom-cursor bg-gray-900 text-white">
      <CustomCursor />
      <ScrollProgress />
      <Header activeSection={activeSection} setActiveSection={setActiveSection} />
      <main>
        <Home />
        <About />
        <Services />
        <section id="repos" className="py-24 bg-gray-800">
          <div className="container mx-auto px-6">
            <SectionHeading eyebrow={t.repos.eyebrow} subtitle={t.repos.subtitle}>
              {t.repos.titleLead}<span className="text-blue-400">{t.repos.titleHighlight}</span>
            </SectionHeading>
            <Reveal delay={120}>
              <GitHubRepos />
            </Reveal>
          </div>
        </section>
        <Projects />
        <Contact />
      </main>
      <BackToTop />
    </div>
  );
}

function AdminFallback() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<AdminFallback />}>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/content" element={<AdminContent />} />
          <Route path="/admin/messages" element={<AdminMessages />} />
          <Route path="/admin/status" element={<AdminStatus />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
