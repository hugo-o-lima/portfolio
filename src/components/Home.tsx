import React from 'react';
import { ChevronDown } from 'lucide-react';

const Home: React.FC = () => {
  const scrollToAbout = () => {
    const element = document.getElementById('about');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9IiMwMEJGRkYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9nPjwvc3ZnPg==')] opacity-50"></div>
      
      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="animate-fadeInUp">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Olá, eu sou{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              João Silva
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Desenvolvedor Frontend apaixonado por criar experiências digitais incríveis e inovadoras
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={scrollToAbout}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Conheça mais sobre mim
            </button>
            <button
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3 border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Entre em contato
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={scrollToAbout}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-blue-400 hover:text-blue-300 transition-colors duration-300 animate-bounce"
      >
        <ChevronDown size={32} />
      </button>
    </section>
  );
};

export default Home;