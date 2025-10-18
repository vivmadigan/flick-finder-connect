import { ReactNode } from 'react';
import { FilmGrainOverlay } from '@/components/visual/FilmGrainOverlay';
import { BokehLayer } from '@/components/visual/BokehLayer';
import { Letterbox } from '@/components/visual/Letterbox';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { useVisualFX } from '@/context/VisualFXProvider';

interface AppShellProps {
  children: ReactNode;
  showLetterbox?: boolean;
}

export function AppShell({ children, showLetterbox = false }: AppShellProps) {
  const { preset } = useVisualFX();

  const showGrain = preset !== 'off';
  const showBokeh = preset === 'hero' || preset === 'standard';

  return (
    <>
      {/* Visual FX layers */}
      {showGrain && <FilmGrainOverlay />}
      {showBokeh && <BokehLayer />}
      {showLetterbox && <Letterbox />}

      {/* Main content */}
      {children}

      {/* Toast notifications */}
      <Toaster />
      <Sonner />
    </>
  );
}
