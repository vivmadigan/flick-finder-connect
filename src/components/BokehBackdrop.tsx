import { useEffect, useState } from 'react';

export function BokehBackdrop() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base gradient layer */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, hsl(202 52% 12% / 0.4) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, hsl(46 65% 52% / 0.08) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, hsl(192 80% 57% / 0.05) 0%, transparent 70%)
          `,
        }}
      />
      
      {/* Soft blur layer for bokeh effect */}
      {!prefersReducedMotion && (
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, hsl(46 65% 52% / 0.15) 0%, transparent 30%),
              radial-gradient(circle at 70% 80%, hsl(192 80% 57% / 0.12) 0%, transparent 35%),
              radial-gradient(circle at 50% 60%, hsl(202 52% 18% / 0.2) 0%, transparent 40%)
            `,
            filter: 'blur(40px)',
          }}
        />
      )}
    </div>
  );
}
