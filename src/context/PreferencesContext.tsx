import { createContext, useContext, useState, ReactNode } from 'react';
import { Preferences } from '@/types';

interface PreferencesContextType {
  preferences: Preferences;
  updatePreferences: (prefs: Partial<Preferences>) => void;
  resetPreferences: () => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

const initialPreferences: Preferences = {
  genre: undefined,
  lengthBucket: undefined,
};

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(initialPreferences);

  const updatePreferences = (prefs: Partial<Preferences>) => {
    setPreferences((prev) => ({ ...prev, ...prefs }));
  };

  const resetPreferences = () => {
    setPreferences(initialPreferences);
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updatePreferences,
        resetPreferences,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
