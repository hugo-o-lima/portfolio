import React from 'react';
import { ChevronDown, Github, Linkedin } from 'lucide-react';
import Typewriter from './Typewriter';
import { useLanguage } from '../i18n/useLanguage';
import { useContent } from '../content/useContent';

const stagger = (step: number): React.CSSProperties => ({ animationDelay: `${step * 0.15}s` });

const Home: React.FC = () => {
  const { t, lang } = useLanguage();
  const { content } = useContent();
  const home = content.home;

  const scrollToAbout = () => {
    const element = document.getElementById('about');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9IiMwMEJGRkYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9nPjwvc3ZnPg==')] opacity-50"></div>
      <div className="absolute -top-40 -left-40 w-[28rem] h-[28rem] bg-blue-500/10 rounded-full blur-3xl animate-float" aria-hidden="true"></div>
      <div className="absolute -bottom-40 -right-40 w-[28rem] h-[28rem] bg-blue-600/10 rounded-full blur-3xl animate-float-slow" aria-hidden="true"></div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <div>
          <div className="animate-fadeInUp" style={stagger(0)}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-300 text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              {home.badge}
            </span>
          </div>

          <p className="font-mono text-blue-400 text-sm md:text-base mb-6 animate-fadeInUp" style={stagger(1)}>
            <span className="text-gray-500">$</span> whoami
          </p>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-5 tracking-tight animate-fadeInUp" style={stagger(2)}>
            {home.greeting}{' '}
            <span className="gradient-text">{home.name}</span>
          </h1>

          <p className="font-mono text-lg md:text-2xl text-gray-300 mb-6 h-8 animate-fadeInUp" style={stagger(3)}>
            <span className="text-blue-400">&gt;</span>{' '}
            <Typewriter key={`${lang}-${home.typewriter.join('|')}`} phrases={[...home.typewriter]} />
          </p>

          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed animate-fadeInUp" style={stagger(4)}>
            {home.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp" style={stagger(5)}>
            <button
              onClick={scrollToAbout}
              className="btn-shine px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25"
            >
              {t.home.ctaAbout}
            </button>
            <button
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3 border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              {t.home.ctaContact}
            </button>
          </div>

          <div className="flex justify-center gap-5 mt-12 animate-fadeInUp" style={stagger(6)}>
            <a
              href={home.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="p-3 bg-gray-800/60 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-blue-500 hover:-translate-y-1 transition-all duration-300"
            >
              <Github size={22} />
            </a>
            <a
              href={home.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="p-3 bg-gray-800/60 border border-gray-700 rounded-lg text-gray-400 hover:text-blue-400 hover:border-blue-500 hover:-translate-y-1 transition-all duration-300"
            >
              <Linkedin size={22} />
            </a>
          </div>
        </div>
      </div>

      <button
        onClick={scrollToAbout}
        aria-label={t.home.scrollAria}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-blue-400 hover:text-blue-300 transition-colors duration-300 animate-bounce"
      >
        <ChevronDown size={32} />
      </button>
    </section>
  );
};

export default Home;
