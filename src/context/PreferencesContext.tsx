import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Preferences } from '@/types';

interface PreferencesContextType {
  preferences: Preferences;
  likedMovieIds: string[];
  updatePreferences: (prefs: Partial<Preferences>) => void;
  addLikedMovie: (movieId: string) => void;
  resetPreferences: () => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PREFERENCES: 'cinematch_preferences',
  LIKED_MOVIES: 'cinematch_liked_movies',
};

const initialPreferences: Preferences = {
  genre: undefined,
  lengthBucket: undefined,
};

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(() =>
    loadFromStorage(STORAGE_KEYS.PREFERENCES, initialPreferences)
  );
  const [likedMovieIds, setLikedMovieIds] = useState<string[]>(() =>
    loadFromStorage(STORAGE_KEYS.LIKED_MOVIES, [])
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PREFERENCES, preferences);
  }, [preferences]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.LIKED_MOVIES, likedMovieIds);
  }, [likedMovieIds]);

  const updatePreferences = (prefs: Partial<Preferences>) => {
    setPreferences((prev) => ({ ...prev, ...prefs }));
  };

  const addLikedMovie = (movieId: string) => {
    setLikedMovieIds((prev) => (prev.includes(movieId) ? prev : [...prev, movieId]));
  };

  const resetPreferences = () => {
    setPreferences(initialPreferences);
    setLikedMovieIds([]);
    localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
    localStorage.removeItem(STORAGE_KEYS.LIKED_MOVIES);
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        likedMovieIds,
        updatePreferences,
        addLikedMovie,
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
