import React, { useState } from 'react';
import { Mail, Phone, MapPin, Github, Linkedin, Instagram } from 'lucide-react';

const Contact: React.FC = () => {
  const socialLinks = [
    {
      name: 'GitHub',
      icon: Github,
      url: 'https://github.com/joaosilva',
      color: 'hover:text-gray-300'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: 'https://linkedin.com/in/joaosilva',
      color: 'hover:text-blue-400'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://instagram.com/joaosilva',
      color: 'hover:text-pink-400'
    }
  ];

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'joao.silva@email.com',
      href: 'mailto:joao.silva@email.com'
    },
    {
      icon: Phone,
      label: 'Telefone',
      value: '+55 (11) 99999-9999',
      href: 'tel:+5511999999999'
    },
    {
      icon: MapPin,
      label: 'Localização',
      value: 'São Paulo, Brasil',
      href: '#'
    }
  ];

  return (
    <section id="contact" className="py-20 bg-gray-800">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Entre em <span className="text-blue-400">Contato</span>
          </h2>
          <div className="w-24 h-1 bg-blue-500 mx-auto mb-6"></div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Tem alguma ideia interessante ou oportunidade? Vamos conversar!
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Informações de Contato */}
          <div className="animate-fadeInUp mb-12">
            <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl">
              <h3 className="text-2xl font-semibold text-white mb-8 text-center">Vamos nos conectar</h3>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex flex-col items-center text-center group">
                    <div className="bg-blue-500/20 p-4 rounded-lg mb-3 group-hover:bg-blue-500/30 transition-colors duration-300">
                      <info.icon className="text-blue-400" size={24} />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">{info.label}</p>
                      <a
                        href={info.href}
                        className="text-white hover:text-blue-400 transition-colors duration-300 font-medium"
                      >
                        {info.value}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Redes Sociais */}
          <div className="animate-fadeInUp">
            <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl">
              <h4 className="text-xl font-semibold text-white mb-6 text-center">Redes Sociais</h4>
              <div className="flex justify-center space-x-6">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`bg-gray-800 p-4 rounded-lg text-white ${social.color} transition-all duration-300 transform hover:scale-110 hover:shadow-lg`}
                  >
                    <social.icon size={28} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-700">
          <p className="text-gray-400">
            © 2025 João Silva. Feito com ❤️ e muito café ☕
          </p>
        </div>
      </div>
    </section>
  );
};

export default Contact;