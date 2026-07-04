import { useEffect, useRef, useState } from 'react';

/* Cursor decorativo da vitrine pública. Atualiza a posição direto no DOM
   (sem setState) para não re-renderizar a árvore a cada mousemove, e só
   é montado em dispositivos com ponteiro fino (mouse/trackpad). */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)');
    setEnabled(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setEnabled(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let raf = 0;
    let x = -100;
    let y = -100;
    let hovering = false;

    const render = () => {
      raf = 0;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${x - 10}px, ${y - 10}px) scale(${hovering ? 1.5 : 1})`;
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${x - 20}px, ${y - 20}px)`;
      }
    };

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      hovering = !!(e.target as Element | null)?.closest?.('a, button, input, textarea, [role="button"]');
      if (!raf) raf = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className="cursor" aria-hidden="true" />
      <div ref={glowRef} className="cursor-glow" aria-hidden="true" />
    </>
  );
}
