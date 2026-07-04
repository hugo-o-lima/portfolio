// Default site content. Stored overrides in app_settings (key = `content_<section>`)
// are merged on top of these, so the site always renders even before any admin edit.

export interface HomeContent {
  badge: string;
  greeting: string;
  name: string;
  typewriter: string[];
  subtitle: string;
  githubUrl: string;
  linkedinUrl: string;
}

export interface PersonalInfoItem {
  label: string;
  value: string;
}

export interface HobbyItem {
  icon: string;
  name: string;
}

export interface AboutContent {
  personalInfo: PersonalInfoItem[];
  bioParagraphs: string[];
  skills: string[];
  hobbies: HobbyItem[];
}

export interface ServiceItem {
  icon: string; // 'code' | 'server' | 'database' | ...
  title: string;
  description: string;
  tags: string[];
}

export interface ServicesContent {
  items: ServiceItem[];
}

export interface ContactContent {
  email: string;
  phone: string;
  phoneHref: string;
  location: string;
  githubUrl: string;
  linkedinUrl: string;
}

export interface SiteContent {
  home: HomeContent;
  about: AboutContent;
  services: ServicesContent;
  contact: ContactContent;
}

export const langs = ['pt', 'en'] as const;
export type Lang = (typeof langs)[number];

const ptContent: SiteContent = {
  home: {
    badge: 'Disponível para novos projetos',
    greeting: 'Olá, eu sou',
    name: 'Hugo Antonio',
    typewriter: [
      'Desenvolvedor Full-Stack',
      'Estudante de Ciência da Computação',
      'Apaixonado por tecnologia',
    ],
    subtitle: 'Criando experiências digitais incríveis e inovadoras, do front-end ao banco de dados.',
    githubUrl: 'https://github.com/hugo-o-lima',
    linkedinUrl: 'https://www.linkedin.com/in/hugo-antonio-de-oliveira-lima-5453a6374/',
  },
  about: {
    personalInfo: [
      { label: 'Nome', value: 'Hugo Antonio' },
      { label: 'Idade', value: '18 anos' },
      { label: 'Local', value: 'Maringá, Brasil' },
      { label: 'Formação', value: 'Ciência da Computação' },
    ],
    bioParagraphs: [
      'Sou estudante de Ciência da Computação apaixonado por tecnologia. Atualmente, estou focado em criar aplicações modernas e responsivas usando as mais recentes tecnologias do mercado.',
      'Sempre busco aprender algo novo e me manter atualizado com as tendências do desenvolvimento. Acredito que a tecnologia pode transformar vidas e estou empolgado para fazer parte dessa transformação.',
    ],
    skills: ['JavaScript', 'MySQL', 'Python', 'HTML5', 'CSS3', 'Git'],
    hobbies: [
      { icon: '🎮', name: 'Games' },
      { icon: '📚', name: 'Leitura' },
      { icon: '🎵', name: 'Música' },
      { icon: '🏃‍♂️', name: 'Academia' },
    ],
  },
  services: {
    items: [
      {
        icon: 'code',
        title: 'Front-end Moderno',
        description:
          'Interfaces responsivas e acessíveis com React, TypeScript e Tailwind CSS — com atenção a performance, animações sutis e detalhes de UX.',
        tags: ['React', 'TypeScript', 'Tailwind'],
      },
      {
        icon: 'server',
        title: 'Back-end & APIs',
        description:
          'APIs REST com Node.js e Express, autenticação segura com JWT, validação de dados e integração com serviços externos.',
        tags: ['Node.js', 'Express', 'REST'],
      },
      {
        icon: 'database',
        title: 'Banco de Dados',
        description:
          'Modelagem de dados, consultas eficientes e migrações versionadas — do esquema inicial ao deploy em produção.',
        tags: ['SQL', 'MySQL', 'Migrações'],
      },
    ],
  },
  contact: {
    email: 'hugo.antonio2026@gmail.com',
    phone: '+55 (67) 99992-4440',
    phoneHref: 'tel:+5567999924440',
    location: 'Maringá, Brasil',
    githubUrl: 'https://github.com/hugo-o-lima',
    linkedinUrl: 'https://www.linkedin.com/in/hugo-antonio-de-oliveira-lima-5453a6374/',
  },
};

const enContent: SiteContent = {
  home: {
    badge: 'Available for new projects',
    greeting: "Hi, I'm",
    name: 'Hugo Antonio',
    typewriter: [
      'Full-Stack Developer',
      'Computer Science Student',
      'Passionate about technology',
    ],
    subtitle: 'Building incredible and innovative digital experiences, from the front-end to the database.',
    githubUrl: 'https://github.com/hugo-o-lima',
    linkedinUrl: 'https://www.linkedin.com/in/hugo-antonio-de-oliveira-lima-5453a6374/',
  },
  about: {
    personalInfo: [
      { label: 'Name', value: 'Hugo Antonio' },
      { label: 'Age', value: '18 years old' },
      { label: 'Location', value: 'Maringá, Brazil' },
      { label: 'Education', value: 'Computer Science' },
    ],
    bioParagraphs: [
      'I am a Computer Science student passionate about technology. I am currently focused on building modern, responsive applications using the latest technologies on the market.',
      'I always look to learn something new and stay up to date with development trends. I believe technology can transform lives and I am excited to be part of that transformation.',
    ],
    skills: ['JavaScript', 'MySQL', 'Python', 'HTML5', 'CSS3', 'Git'],
    hobbies: [
      { icon: '🎮', name: 'Games' },
      { icon: '📚', name: 'Reading' },
      { icon: '🎵', name: 'Music' },
      { icon: '🏃‍♂️', name: 'Gym' },
    ],
  },
  services: {
    items: [
      {
        icon: 'code',
        title: 'Modern Front-end',
        description:
          'Responsive, accessible interfaces with React, TypeScript and Tailwind CSS — with attention to performance, subtle animations and UX details.',
        tags: ['React', 'TypeScript', 'Tailwind'],
      },
      {
        icon: 'server',
        title: 'Back-end & APIs',
        description:
          'REST APIs with Node.js and Express, secure JWT authentication, data validation and integration with external services.',
        tags: ['Node.js', 'Express', 'REST'],
      },
      {
        icon: 'database',
        title: 'Databases',
        description:
          'Data modeling, efficient queries and versioned migrations — from the initial schema to production deployment.',
        tags: ['SQL', 'MySQL', 'Migrations'],
      },
    ],
  },
  contact: {
    email: 'hugo.antonio2026@gmail.com',
    phone: '+55 (67) 99992-4440',
    phoneHref: 'tel:+5567999924440',
    location: 'Maringá, Brazil',
    githubUrl: 'https://github.com/hugo-o-lima',
    linkedinUrl: 'https://www.linkedin.com/in/hugo-antonio-de-oliveira-lima-5453a6374/',
  },
};

// Default site content per language. Stored overrides (key = `content_<lang>_<section>`)
// are merged on top of these.
export const defaultContent: Record<Lang, SiteContent> = {
  pt: ptContent,
  en: enContent,
};

export type ContentSection = keyof SiteContent;

export const contentSections: ContentSection[] = ['home', 'about', 'services', 'contact'];
