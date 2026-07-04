import { useEffect, useState } from 'react';

interface TypewriterProps {
  phrases: string[];
  typingMs?: number;
  deletingMs?: number;
  pauseMs?: number;
  className?: string;
}

/* Digita e apaga as frases em loop. Com prefers-reduced-motion, mostra a primeira frase estática. */
export default function Typewriter({
  phrases,
  typingMs = 70,
  deletingMs = 35,
  pauseMs = 2000,
  className = '',
}: TypewriterProps) {
  const [text, setText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const current = phrases[phraseIndex];

    let delay: number;
    if (!deleting && text === current) {
      delay = pauseMs;
    } else if (deleting && text === '') {
      delay = 300;
    } else {
      delay = deleting ? deletingMs : typingMs;
    }

    const timer = setTimeout(() => {
      if (!deleting && text === current) {
        setDeleting(true);
      } else if (deleting && text === '') {
        setDeleting(false);
        setPhraseIndex((i) => (i + 1) % phrases.length);
      } else {
        setText(current.slice(0, text.length + (deleting ? -1 : 1)));
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [text, deleting, phraseIndex, phrases, typingMs, deletingMs, pauseMs, reducedMotion]);

  if (reducedMotion) {
    return <span className={className}>{phrases[0]}</span>;
  }

  return (
    <span className={className} aria-label={phrases[phraseIndex]}>
      {text}
      <span className="typewriter-caret" aria-hidden="true" />
    </span>
  );
}
