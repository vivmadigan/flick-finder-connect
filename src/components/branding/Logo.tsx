import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, iconOnly = false, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-6 h-6', text: 'text-xl' },
    md: { icon: 'w-8 h-8', text: 'text-2xl' },
    lg: { icon: 'w-12 h-12', text: 'text-4xl' },
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Film Reel "C" Icon */}
      <svg
        className={cn(sizes[size].icon, 'flex-shrink-0')}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="CineMatch Logo"
      >
        {/* Main "C" circular stroke */}
        <path
          d="M16 4C9.373 4 4 9.373 4 16C4 22.627 9.373 28 16 28C19.5 28 22.6 26.3 24.6 23.6"
          stroke="url(#gold-gradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Sprocket holes */}
        <circle cx="10" cy="8" r="1.5" fill="hsl(var(--gold))" opacity="0.8" />
        <circle cx="8" cy="16" r="1.5" fill="hsl(var(--gold))" opacity="0.8" />
        <circle cx="10" cy="24" r="1.5" fill="hsl(var(--gold))" opacity="0.8" />
        
        <defs>
          <linearGradient id="gold-gradient" x1="4" y1="4" x2="28" y2="28">
            <stop offset="0%" stopColor="hsl(46 80% 65%)" />
            <stop offset="100%" stopColor="hsl(46 65% 52%)" />
          </linearGradient>
        </defs>
      </svg>

      {!iconOnly && (
        <div className={cn('font-display font-semibold', sizes[size].text)}>
          <span
            className="bg-gradient-to-r from-[hsl(46,80%,65%)] via-[hsl(46,65%,52%)] to-[hsl(46,80%,65%)] bg-clip-text text-transparent"
            style={{ textShadow: '0 2px 8px rgba(212,175,55,0.3)' }}
          >
            Cine
          </span>
          <span className="text-foreground/90">Match</span>
        </div>
      )}
    </div>
  );
}
