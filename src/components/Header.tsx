import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../i18n/useLanguage';
import LanguageSwitch from './LanguageSwitch';

interface HeaderProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, setActiveSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useLanguage();

  const menuItems = [
    { id: 'home', label: t.header.nav.home },
    { id: 'about', label: t.header.nav.about },
    { id: 'services', label: t.header.nav.services },
    { id: 'repos', label: t.header.nav.repos },
    { id: 'projects', label: t.header.nav.projects },
    { id: 'contact', label: t.header.nav.contact }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
      setIsMenuOpen(false);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-800' : 'bg-transparent'
    }`}>
      <nav className="container mx-auto px-6 py-4" aria-label={t.header.nav_aria}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => scrollToSection('home')}
            className="text-2xl font-bold text-white font-mono"
            aria-label={t.header.backToTop}
          >
            <span className="text-blue-400">{'<'}</span>
            hugo-antonio
            <span className="text-blue-400">{'/>'}</span>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <ul className="flex space-x-8">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className={`relative text-white hover:text-blue-400 transition-colors duration-300 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-blue-400 after:origin-left after:transition-transform after:duration-300 ${
                      activeSection === item.id
                        ? 'text-blue-400 after:scale-x-100'
                        : 'after:scale-x-0 hover:after:scale-x-100'
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
            <LanguageSwitch />
          </div>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-3">
            <LanguageSwitch />
            <button
              className="text-white hover:text-blue-400 transition-colors duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? t.header.closeMenu : t.header.openMenu}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-700">
            <ul className="space-y-4">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className={`block w-full text-left text-white hover:text-blue-400 transition-colors duration-300 ${
                      activeSection === item.id ? 'text-blue-400' : ''
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;