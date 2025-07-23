import React from 'react';

const Projects: React.FC = () => {
  return (
    <section id="projects" className="py-32 bg-gray-800 min-h-[40vh] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Projetos
        </h2>
        <div className="w-24 h-1 bg-blue-500 mx-auto mb-8"></div>
        <p className="text-2xl text-gray-400 animate-pulse">Em construção 🚧</p>
      </div>
    </section>
  );
};

export default Projects; 