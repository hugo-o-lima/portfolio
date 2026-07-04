import React, { useState } from 'react';
import { Mail, Phone, MapPin, Github, Linkedin, Send } from 'lucide-react';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';
import { useLanguage } from '../../i18n/useLanguage';
import { useContent } from '../../content/useContent';

type FormStatus = 'idle' | 'sending' | 'success' | 'error';

const Contact: React.FC = () => {
  const { t } = useLanguage();
  const { content } = useContent();
  const c = content.contact;

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [website, setWebsite] = useState(''); // honeypot
  const [status, setStatus] = useState<FormStatus>('idle');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject || null,
          body: form.message,
          website,
        }),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    }
  }

  const socialLinks = [
    {
      name: 'GitHub',
      icon: Github,
      url: c.githubUrl,
      color: 'hover:text-gray-300'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: c.linkedinUrl,
      color: 'hover:text-blue-400'
    },
  ];

  const contactInfo = [
    {
      icon: Mail,
      label: t.contact.labels.email,
      value: c.email,
      href: `mailto:${c.email}`
    },
    {
      icon: Phone,
      label: t.contact.labels.phone,
      value: c.phone,
      href: c.phoneHref
    },
    {
      icon: MapPin,
      label: t.contact.labels.location,
      value: c.location,
      href: null
    }
  ];

  return (
    <section id="contact" className="py-24 bg-gray-800">
      <div className="container mx-auto px-6">
        <SectionHeading eyebrow={t.contact.eyebrow} subtitle={t.contact.subtitle}>
          {t.contact.titleLead} <span className="text-blue-400">{t.contact.titleHighlight}</span>
        </SectionHeading>

        <div className="max-w-4xl mx-auto">
          {/* Informações de Contato */}
          <Reveal className="mb-12">
            <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700/50">
              <h3 className="text-2xl font-semibold text-white mb-8 text-center">{t.contact.connectTitle}</h3>

              <div className="grid md:grid-cols-3 gap-6 mb-10">
                {contactInfo.map((info) => (
                  <div key={info.label} className="flex flex-col items-center text-center group">
                    <div className="bg-blue-500/20 p-4 rounded-lg mb-3 group-hover:bg-blue-500/30 transition-colors duration-300">
                      <info.icon className="text-blue-400" size={24} aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">{info.label}</p>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="text-white hover:text-blue-400 transition-colors duration-300 font-medium break-all"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <span className="text-white font-medium">{info.value}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <a
                  href={`mailto:${c.email}`}
                  className="btn-shine inline-flex items-center gap-2 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25"
                >
                  <Send size={18} aria-hidden="true" />
                  {t.contact.sayHello}
                </a>
              </div>
            </div>
          </Reveal>

          {/* Formulário de contato */}
          <Reveal delay={80} className="mb-12">
            <form
              onSubmit={handleSubmit}
              className="bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700/50"
              noValidate
            >
              <h3 className="text-2xl font-semibold text-white mb-8 text-center">{t.contact.form.title}</h3>

              {/* Honeypot: escondido de usuários reais, capturado por bots */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label htmlFor="name" className="block text-gray-400 text-sm mb-2">{t.contact.form.name}</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    maxLength={120}
                    value={form.name}
                    onChange={handleChange}
                    placeholder={t.contact.form.namePlaceholder}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-gray-400 text-sm mb-2">{t.contact.form.email}</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder={t.contact.form.emailPlaceholder}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label htmlFor="subject" className="block text-gray-400 text-sm mb-2">{t.contact.form.subject}</label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  maxLength={200}
                  value={form.subject}
                  onChange={handleChange}
                  placeholder={t.contact.form.subjectPlaceholder}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="message" className="block text-gray-400 text-sm mb-2">{t.contact.form.message}</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  maxLength={5000}
                  value={form.message}
                  onChange={handleChange}
                  placeholder={t.contact.form.messagePlaceholder}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-y"
                />
              </div>

              {status === 'success' && (
                <p className="mb-4 text-sm text-green-400 bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3" role="status">
                  {t.contact.form.success}
                </p>
              )}
              {status === 'error' && (
                <p className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3" role="alert">
                  {t.contact.form.error}
                </p>
              )}

              <div className="text-center">
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="btn-shine inline-flex items-center gap-2 px-8 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25"
                >
                  <Send size={18} aria-hidden="true" />
                  {status === 'sending' ? t.contact.form.sending : t.contact.form.send}
                </button>
              </div>
            </form>
          </Reveal>

          {/* Redes Sociais */}
          <Reveal delay={120}>
            <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700/50">
              <h4 className="text-xl font-semibold text-white mb-6 text-center">{t.contact.socialTitle}</h4>
              <div className="flex justify-center space-x-6">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className={`bg-gray-800 border border-gray-700 p-4 rounded-lg text-white ${social.color} transition-all duration-300 transform hover:scale-110 hover:border-blue-500 hover:shadow-lg`}
                  >
                    <social.icon size={28} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 pt-8 border-t border-gray-700">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Hugo Antonio. {t.contact.rights}
          </p>
          <p className="text-gray-500 text-sm mt-2 font-mono">
            {t.contact.madeWith}
          </p>
        </footer>
      </div>
    </section>
  );
};

export default Contact;
