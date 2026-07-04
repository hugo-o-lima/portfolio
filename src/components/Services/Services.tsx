import React from 'react';
import { Code2, Server, Database } from 'lucide-react';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';
import SpotlightCard from '../SpotlightCard';
import { useLanguage } from '../../i18n/useLanguage';
import { useContent } from '../../content/useContent';

// Mapeia o nome do ícone (editável no admin) para o componente lucide.
const iconMap: Record<string, typeof Code2> = {
  code: Code2,
  server: Server,
  database: Database,
};

const Services: React.FC = () => {
  const { t } = useLanguage();
  const { content } = useContent();

  const services = content.services.items.map((item) => ({
    ...item,
    Icon: iconMap[item.icon] ?? Code2,
  }));

  return (
    <section id="services" className="py-24 bg-gray-900">
      <div className="container mx-auto px-6">
        <SectionHeading eyebrow={t.services.eyebrow} subtitle={t.services.subtitle}>
          {t.services.titleLead} <span className="text-blue-400">{t.services.titleHighlight}</span>
        </SectionHeading>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <Reveal key={`${service.title}-${index}`} delay={index * 120} className="h-full">
              <SpotlightCard className="group bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-blue-500/60 transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
                <div className="w-14 h-14 flex items-center justify-center bg-blue-500/15 border border-blue-500/30 rounded-xl mb-6 group-hover:bg-blue-500/25 transition-colors duration-300">
                  <service.Icon className="text-blue-400" size={26} aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{service.title}</h3>
                <p className="text-gray-400 leading-relaxed mb-6 flex-1">{service.description}</p>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-xs text-blue-300/90 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
