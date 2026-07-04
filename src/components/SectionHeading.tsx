import type { ReactNode } from 'react';
import Reveal from './Reveal';

interface SectionHeadingProps {
  eyebrow: string;
  children: ReactNode;
  subtitle?: string;
}

/* Cabeçalho padrão das seções: eyebrow em mono, título, divisor e subtítulo opcional. */
export default function SectionHeading({ eyebrow, children, subtitle }: SectionHeadingProps) {
  return (
    <Reveal className="text-center mb-16">
      <p className="font-mono text-blue-400 text-sm mb-3">{eyebrow}</p>
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">{children}</h2>
      <div className="grow-line w-24 h-1 bg-blue-500 mx-auto" />
      {subtitle && (
        <p className="text-gray-400 text-lg mt-6 max-w-2xl mx-auto">{subtitle}</p>
      )}
    </Reveal>
  );
}
