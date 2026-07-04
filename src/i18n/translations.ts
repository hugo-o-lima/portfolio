// Textos do site em português (idioma original) e inglês.
// O idioma padrão é 'pt'. A troca é feita pelo LanguageContext.

export const LANGS = ['pt', 'en'] as const;
export type Lang = (typeof LANGS)[number];

const pt = {
  header: {
    nav: {
      home: 'Home',
      about: 'Sobre',
      services: 'O que faço',
      repos: 'Repositórios',
      projects: 'Projetos',
      contact: 'Contato',
    },
    backToTop: 'Voltar ao topo',
    openMenu: 'Abrir menu',
    closeMenu: 'Fechar menu',
    nav_aria: 'Navegação principal',
    switchTo: 'Switch to English',
  },
  home: {
    badge: 'Disponível para novos projetos',
    greeting: 'Olá, eu sou',
    typewriter: [
      'Desenvolvedor Full-Stack',
      'Estudante de Ciência da Computação',
      'Apaixonado por tecnologia',
    ],
    subtitle:
      'Criando experiências digitais incríveis e inovadoras, do front-end ao banco de dados.',
    ctaAbout: 'Conheça mais sobre mim',
    ctaContact: 'Entre em contato',
    scrollAria: 'Rolar para a seção Sobre',
  },
  about: {
    eyebrow: '// 01. quem-sou-eu',
    titleLead: 'Sobre',
    titleHighlight: 'Mim',
    personalInfoTitle: 'Informações Pessoais',
    personalInfo: [
      { label: 'Nome', value: 'Hugo Antonio' },
      { label: 'Idade', value: '18 anos' },
      { label: 'Local', value: 'Maringá, Brasil' },
      { label: 'Formação', value: 'Ciência da Computação' },
    ],
    journeyTitle: 'Sobre minha jornada',
    bio: [
      'Sou estudante de Ciência da Computação apaixonado por tecnologia. Atualmente, estou focado em criar aplicações modernas e responsivas usando as mais recentes tecnologias do mercado.',
      'Sempre busco aprender algo novo e me manter atualizado com as tendências do desenvolvimento. Acredito que a tecnologia pode transformar vidas e estou empolgado para fazer parte dessa transformação.',
    ],
    skillsTitle: 'Habilidades Técnicas',
    hobbiesTitle: 'Hobbies & Interesses',
    hobbies: ['Games', 'Leitura', 'Música', 'Academia'],
  },
  services: {
    eyebrow: '// 02. o-que-eu-faco',
    subtitle: 'Do design à infraestrutura: gosto de construir o produto inteiro.',
    titleLead: 'O que eu',
    titleHighlight: 'faço',
    items: [
      {
        title: 'Front-end Moderno',
        description:
          'Interfaces responsivas e acessíveis com React, TypeScript e Tailwind CSS — com atenção a performance, animações sutis e detalhes de UX.',
      },
      {
        title: 'Back-end & APIs',
        description:
          'APIs REST com Node.js e Express, autenticação segura com JWT, validação de dados e integração com serviços externos.',
      },
      {
        title: 'Banco de Dados',
        description:
          'Modelagem de dados, consultas eficientes e migrações versionadas — do esquema inicial ao deploy em produção.',
      },
    ],
  },
  repos: {
    eyebrow: '// 03. open-source',
    subtitle: 'Código aberto, direto do meu GitHub.',
    titleLead: 'Repositó',
    titleHighlight: 'rios',
    error: 'Não foi possível carregar os repositórios agora.',
    seeOnGitHub: 'Veja direto no GitHub',
    viewAll: 'ver todos no GitHub →',
  },
  projects: {
    eyebrow: '// 04. trabalhos',
    subtitle: 'Uma seleção do que venho construindo.',
    titleLead: 'Proje',
    titleHighlight: 'tos',
    error: 'Erro ao carregar projetos.',
    comingSoon: 'Em breve...',
    code: 'Código',
    viewProject: 'Ver projeto',
  },
  contact: {
    eyebrow: '// 05. fale-comigo',
    subtitle: 'Tem alguma ideia interessante ou oportunidade? Vamos conversar!',
    titleLead: 'Entre em',
    titleHighlight: 'Contato',
    connectTitle: 'Vamos nos conectar',
    labels: { email: 'Email', phone: 'Telefone', location: 'Localização' },
    location: 'Maringá, Brasil',
    sayHello: 'Diga olá',
    socialTitle: 'Redes Sociais',
    rights: 'Todos os direitos reservados.',
    madeWith: 'feito com React + TypeScript',
    form: {
      title: 'Envie uma mensagem',
      name: 'Nome',
      namePlaceholder: 'Seu nome',
      email: 'Email',
      emailPlaceholder: 'voce@exemplo.com',
      subject: 'Assunto',
      subjectPlaceholder: 'Sobre o que você quer falar?',
      message: 'Mensagem',
      messagePlaceholder: 'Escreva sua mensagem...',
      send: 'Enviar mensagem',
      sending: 'Enviando...',
      success: 'Mensagem enviada! Obrigado pelo contato, responderei em breve.',
      error: 'Não foi possível enviar. Tente novamente mais tarde.',
    },
  },
};

const en: typeof pt = {
  header: {
    nav: {
      home: 'Home',
      about: 'About',
      services: 'What I do',
      repos: 'Repositories',
      projects: 'Projects',
      contact: 'Contact',
    },
    backToTop: 'Back to top',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    nav_aria: 'Main navigation',
    switchTo: 'Mudar para Português',
  },
  home: {
    badge: 'Available for new projects',
    greeting: "Hi, I'm",
    typewriter: [
      'Full-Stack Developer',
      'Computer Science Student',
      'Passionate about technology',
    ],
    subtitle:
      'Building incredible and innovative digital experiences, from the front-end to the database.',
    ctaAbout: 'Learn more about me',
    ctaContact: 'Get in touch',
    scrollAria: 'Scroll to the About section',
  },
  about: {
    eyebrow: '// 01. who-am-i',
    titleLead: 'About',
    titleHighlight: 'Me',
    personalInfoTitle: 'Personal Info',
    personalInfo: [
      { label: 'Name', value: 'Hugo Antonio' },
      { label: 'Age', value: '18 years old' },
      { label: 'Location', value: 'Maringá, Brazil' },
      { label: 'Education', value: 'Computer Science' },
    ],
    journeyTitle: 'About my journey',
    bio: [
      'I am a Computer Science student passionate about technology. I am currently focused on building modern, responsive applications using the latest technologies on the market.',
      'I always look to learn something new and stay up to date with development trends. I believe technology can transform lives and I am excited to be part of that transformation.',
    ],
    skillsTitle: 'Technical Skills',
    hobbiesTitle: 'Hobbies & Interests',
    hobbies: ['Games', 'Reading', 'Music', 'Gym'],
  },
  services: {
    eyebrow: '// 02. what-i-do',
    subtitle: 'From design to infrastructure: I like building the whole product.',
    titleLead: 'What I',
    titleHighlight: 'do',
    items: [
      {
        title: 'Modern Front-end',
        description:
          'Responsive, accessible interfaces with React, TypeScript and Tailwind CSS — with attention to performance, subtle animations and UX details.',
      },
      {
        title: 'Back-end & APIs',
        description:
          'REST APIs with Node.js and Express, secure JWT authentication, data validation and integration with external services.',
      },
      {
        title: 'Databases',
        description:
          'Data modeling, efficient queries and versioned migrations — from the initial schema to production deployment.',
      },
    ],
  },
  repos: {
    eyebrow: '// 03. open-source',
    subtitle: 'Open source, straight from my GitHub.',
    titleLead: 'Reposi',
    titleHighlight: 'tories',
    error: 'Could not load the repositories right now.',
    seeOnGitHub: 'See it directly on GitHub',
    viewAll: 'view all on GitHub →',
  },
  projects: {
    eyebrow: '// 04. work',
    subtitle: 'A selection of what I have been building.',
    titleLead: 'Proj',
    titleHighlight: 'ects',
    error: 'Error loading projects.',
    comingSoon: 'Coming soon...',
    code: 'Code',
    viewProject: 'View project',
  },
  contact: {
    eyebrow: '// 05. talk-to-me',
    subtitle: 'Got an interesting idea or opportunity? Let’s talk!',
    titleLead: 'Get in',
    titleHighlight: 'Touch',
    connectTitle: 'Let’s connect',
    labels: { email: 'Email', phone: 'Phone', location: 'Location' },
    location: 'Maringá, Brazil',
    sayHello: 'Say hello',
    socialTitle: 'Social Media',
    rights: 'All rights reserved.',
    madeWith: 'made with React + TypeScript',
    form: {
      title: 'Send a message',
      name: 'Name',
      namePlaceholder: 'Your name',
      email: 'Email',
      emailPlaceholder: 'you@example.com',
      subject: 'Subject',
      subjectPlaceholder: 'What would you like to talk about?',
      message: 'Message',
      messagePlaceholder: 'Write your message...',
      send: 'Send message',
      sending: 'Sending...',
      success: 'Message sent! Thanks for reaching out, I will reply soon.',
      error: 'Could not send. Please try again later.',
    },
  },
};

export const translations = { pt, en };

export type Translation = typeof pt;
