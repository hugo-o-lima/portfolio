import { useRef, type ReactNode, type MouseEvent } from 'react';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
}

/* Card com brilho radial que segue o mouse (efeito spotlight). */
export default function SpotlightCard({ children, className = '' }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div ref={ref} onMouseMove={onMouseMove} className={`spotlight-card ${className}`}>
      {children}
    </div>
  );
}
