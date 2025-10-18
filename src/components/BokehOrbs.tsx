import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Orb {
  id: number;
  size: number;
  initialX: number;
  initialY: number;
  color: string;
  duration: number;
  delay: number;
}

const ORB_COUNT = 8;

const COLORS = [
  'hsl(46 65% 52% / 0.12)',
  'hsl(192 80% 57% / 0.10)',
  'hsl(202 52% 20% / 0.15)',
  'hsl(46 65% 52% / 0.08)',
];

function generateOrbs(): Orb[] {
  return Array.from({ length: ORB_COUNT }, (_, i) => ({
    id: i,
    size: Math.random() * 200 + 100, // 100-300px
    initialX: Math.random() * 100, // 0-100%
    initialY: Math.random() * 100,
    color: COLORS[i % COLORS.length],
    duration: Math.random() * 8 + 12, // 12-20s
    delay: Math.random() * 5,
  }));
}

export function BokehOrbs() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [orbs] = useState(generateOrbs);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full"
          style={{
            left: `${orb.initialX}%`,
            top: `${orb.initialY}%`,
            width: orb.size,
            height: orb.size,
            background: orb.color,
            filter: 'blur(12px)',
          }}
          animate={{
            x: [0, 30, -20, 20, 0],
            y: [0, -30, 20, 10, 0],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
