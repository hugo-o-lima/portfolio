import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import Projects from './components/Projects';
import GitHubRepos from './GitHubRepos';

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'repos', 'projects', 'contact'];
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

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="bg-gray-900 text-white">
      {/* Cursor personalizado */}
      <div
        className="cursor"
        style={{
          left: `${cursorPosition.x - 10}px`,
          top: `${cursorPosition.y - 10}px`,
        }}
      />
      <div
        className="cursor-glow"
        style={{
          left: `${cursorPosition.x - 20}px`,
          top: `${cursorPosition.y - 20}px`,
        }}
      />
      
      <Header activeSection={activeSection} setActiveSection={setActiveSection} />
      <Home />
      <About />
      <section id="repos" className="py-32 bg-gray-800 min-h-[40vh] flex items-center justify-center">
        <div className="text-center w-full">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Repositórios</h2>
          <div className="w-24 h-1 bg-blue-500 mx-auto mb-8"></div>
          <GitHubRepos />
        </div>
      </section>
      <Projects />
      <Contact />
    </div>
  );
}

export default App;