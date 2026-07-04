import React from 'react';
import { User, MapPin, GraduationCap, Heart } from 'lucide-react';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';
import { useLanguage } from '../../i18n/useLanguage';
import { useContent } from '../../content/useContent';

const infoIcons = [undefined, undefined, MapPin, GraduationCap] as const;

const About: React.FC = () => {
  const { t } = useLanguage();
  const { content } = useContent();
  const about = content.about;

  const personalInfo = about.personalInfo.map((info, i) => ({
    ...info,
    icon: infoIcons[i],
  }));

  const skills = about.skills;
  const hobbies = about.hobbies;

  return (
    <section id="about" className="py-24 bg-gray-800">
      <div className="container mx-auto px-6">
        <SectionHeading eyebrow={t.about.eyebrow}>
          {t.about.titleLead} <span className="text-blue-400">{t.about.titleHighlight}</span>
        </SectionHeading>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          <Reveal>
            <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700/50 h-full">
              <div className="flex items-center mb-6">
                <User className="text-blue-400 mr-3" size={24} />
                <h3 className="text-2xl font-semibold text-white">{t.about.personalInfoTitle}</h3>
              </div>

              <div className="space-y-4 text-gray-300">
                {personalInfo.map((info) => (
                  <div key={info.label} className="flex items-center gap-3">
                    <span className="font-semibold text-blue-400 w-24 shrink-0">{info.label}:</span>
                    <span className="flex items-center gap-2">
                      {info.icon && <info.icon className="text-blue-400" size={16} aria-hidden="true" />}
                      {info.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700/50 h-full">
              <h3 className="text-2xl font-semibold text-white mb-6">{t.about.journeyTitle}</h3>
              {about.bioParagraphs.map((paragraph, i) => (
                <p
                  key={i}
                  className={`text-gray-300 leading-relaxed ${i < about.bioParagraphs.length - 1 ? 'mb-6' : ''}`}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mt-8 lg:mt-12 items-stretch">
          <Reveal>
            <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700/50 h-full">
              <h3 className="text-2xl font-semibold text-white mb-6">{t.about.skillsTitle}</h3>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium font-mono border border-blue-500/30 hover:bg-blue-500/30 transition-colors duration-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700/50 h-full">
              <div className="flex items-center mb-6">
                <Heart className="text-blue-400 mr-3" size={24} />
                <h3 className="text-2xl font-semibold text-white">{t.about.hobbiesTitle}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {hobbies.map((hobby) => (
                  <div
                    key={hobby.name}
                    className="flex items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-300"
                  >
                    <span className="text-2xl mr-3" aria-hidden="true">{hobby.icon}</span>
                    <span className="text-gray-300">{hobby.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default About;
