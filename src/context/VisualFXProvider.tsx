import { createContext, useContext, useState, ReactNode } from 'react';

type FXPreset = 'hero' | 'standard' | 'dense' | 'off';

interface VisualFXContextType {
  preset: FXPreset;
  setPreset: (preset: FXPreset) => void;
}

const VisualFXContext = createContext<VisualFXContextType | undefined>(undefined);

export function VisualFXProvider({ children }: { children: ReactNode }) {
  const [preset, setPreset] = useState<FXPreset>('standard');

  return (
    <VisualFXContext.Provider value={{ preset, setPreset }}>
      {children}
    </VisualFXContext.Provider>
  );
}

export function useVisualFX() {
  const context = useContext(VisualFXContext);
  if (context === undefined) {
    throw new Error('useVisualFX must be used within a VisualFXProvider');
  }
  return context;
}
