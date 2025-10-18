import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface BokehOrbProps {
  size: number;
  left: string;
  top: string;
  color: string;
  duration: number;
  delay: number;
}

function BokehOrb({ size, left, top, color, duration, delay }: BokehOrbProps) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left,
        top,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: 'blur(16px)',
        opacity: 0.15,
      }}
      animate={{
        x: [0, 30, -20, 20, 0],
        y: [0, -30, 20, 10, 0],
        scale: [1, 1.1, 0.9, 1.05, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

export function BokehLayer() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (prefersReducedMotion || !isVisible) return null;

  const orbs = [
    { size: 200, left: '10%', top: '20%', color: 'hsl(46, 65%, 52%)', duration: 18, delay: 0 },
    { size: 150, left: '80%', top: '10%', color: 'hsl(192, 80%, 57%)', duration: 22, delay: 2 },
    { size: 180, left: '70%', top: '70%', color: 'hsl(46, 65%, 52%)', duration: 20, delay: 4 },
    { size: 120, left: '20%', top: '80%', color: 'hsl(192, 80%, 57%)', duration: 25, delay: 1 },
    { size: 160, left: '50%', top: '50%', color: 'hsl(202, 52%, 18%)', duration: 16, delay: 3 },
    { size: 140, left: '85%', top: '50%', color: 'hsl(46, 70%, 60%)', duration: 19, delay: 5 },
    { size: 100, left: '5%', top: '60%', color: 'hsl(192, 70%, 50%)', duration: 23, delay: 2.5 },
    { size: 130, left: '40%', top: '15%', color: 'hsl(46, 65%, 52%)', duration: 21, delay: 4.5 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {orbs.map((orb, index) => (
        <BokehOrb key={index} {...orb} />
      ))}
    </div>
  );
}
