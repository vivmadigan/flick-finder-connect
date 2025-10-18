import { cn } from '@/lib/utils';

interface HalationGlowProps {
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}

export function HalationGlow({ className, intensity = 'medium' }: HalationGlowProps) {
  const intensityStyles = {
    low: 'opacity-20',
    medium: 'opacity-30',
    high: 'opacity-40',
  };

  return (
    <div
      className={cn(
        'absolute inset-0 pointer-events-none -z-10',
        intensityStyles[intensity],
        className
      )}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, hsl(46 65% 52% / 0.6) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
      />
    </div>
  );
}
