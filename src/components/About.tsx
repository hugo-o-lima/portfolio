import React from 'react';
import { User, MapPin, GraduationCap, Heart } from 'lucide-react';
import GitHubRepos from '../GitHubRepos';

const About: React.FC = () => {
  const skills = [
    'JavaScript', 'MySQL', 'Python',
    'HTML5', 'CSS3', 'Git'
  ];

  const hobbies = [
    { icon: '🎮', name: 'Games' },
    { icon: '📚', name: 'Leitura' },
    { icon: '🎵', name: 'Música' },
    { icon: '🏃‍♂️', name: 'Academia' }
  ];

  return (
    <section id="about" className="py-20 bg-gray-800">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Sobre <span className="text-blue-400">Mim</span>
          </h2>
          <div className="w-24 h-1 bg-blue-500 mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fadeInLeft">
            <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl">
              <div className="flex items-center mb-6">
                <User className="text-blue-400 mr-3" size={24} />
                <h3 className="text-2xl font-semibold text-white">Informações Pessoais</h3>
              </div>
              
              <div className="space-y-4 text-gray-300">
                <div className="flex items-center">
                  <span className="font-semibold text-blue-400 w-20">Nome:</span>
                  <span>Hugo Antonio</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-blue-400 w-20">Idade:</span>
                  <span>18 anos</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="text-blue-400 mr-2" size={16} />
                  <span className="font-semibold text-blue-400 w-18">Local:</span>
                  <span>Maringá, Brasil</span>
                </div>
                <div className="flex items-center">
                  <GraduationCap className="text-blue-400 mr-2" size={16} />
                  <span className="font-semibold text-blue-400 w-18">Formação:</span>
                  <span>Ciência da Computação</span>
                </div>
              </div>
            </div>
          </div>

          <div className="animate-fadeInRight">
            <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl">
              <h3 className="text-2xl font-semibold text-white mb-6">Sobre minha jornada</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                Sou estudante de Ciência da Computação apaixonado por tecnologia. 
                Atualmente, estou focado em criar aplicações modernas e responsivas usando as mais 
                recentes tecnologias do mercado.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Sempre busco aprender algo novo e me manter atualizado com as tendências do 
                desenvolvimento. Acredito que a tecnologia pode transformar vidas e estou 
                empolgado para fazer parte dessa transformação.
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mt-12">
          <div className="animate-fadeInUp">
            <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl">
              <h3 className="text-2xl font-semibold text-white mb-6">Habilidades Técnicas</h3>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium border border-blue-500/30 hover:bg-blue-500/30 transition-colors duration-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="animate-fadeInUp">
            <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl">
              <div className="flex items-center mb-6">
                <Heart className="text-blue-400 mr-3" size={24} />
                <h3 className="text-2xl font-semibold text-white">Hobbies & Interesses</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {hobbies.map((hobby, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-300"
                  >
                    <span className="text-2xl mr-3">{hobby.icon}</span>
                    <span className="text-gray-300">{hobby.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;