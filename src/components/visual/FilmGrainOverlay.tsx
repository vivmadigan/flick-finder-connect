import { useEffect, useState } from 'react';

export function FilmGrainOverlay() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[100]"
      style={{ mixBlendMode: 'soft-light' }}
      aria-hidden="true"
    >
      <svg className="w-full h-full opacity-[var(--grain-opacity)]">
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="4"
            stitchTiles="stitch"
          >
            {!prefersReducedMotion && (
              <animate
                attributeName="baseFrequency"
                dur="8s"
                values="0.9;0.92;0.9"
                repeatCount="indefinite"
              />
            )}
          </feTurbulence>
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  );
}
