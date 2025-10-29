import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Preferences } from '@/types';
import { PreferencesService } from '@/lib/services/PreferencesService';
import { API_MODE } from '@/services/apiMode';
import { useAuth } from './AuthContext';
import { Logger } from '@/lib/logger';

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
  const { user } = useAuth();
  const [currentUserId, setCurrentUserId] = useState<string | null>(user?.id || null);
  const [preferences, setPreferences] = useState<Preferences>(() =>
    loadFromStorage(STORAGE_KEYS.PREFERENCES, initialPreferences)
  );
  const [likedMovieIds, setLikedMovieIds] = useState<string[]>(() =>
    loadFromStorage(STORAGE_KEYS.LIKED_MOVIES, [])
  );

  // Reset preferences when user changes (logout/login with different user)
  useEffect(() => {
    if (user?.id !== currentUserId) {
      console.log('[PreferencesContext] User changed, resetting preferences', {
        previousUser: currentUserId,
        newUser: user?.id,
      });
      setCurrentUserId(user?.id || null);
      
      if (!user) {
        // User logged out, clear everything
        setPreferences(initialPreferences);
        setLikedMovieIds([]);
        localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
        localStorage.removeItem(STORAGE_KEYS.LIKED_MOVIES);
      } else {
        // Different user logged in, load their data from localStorage
        // (which should be empty after SignInForm clears it)
        setPreferences(loadFromStorage(STORAGE_KEYS.PREFERENCES, initialPreferences));
        setLikedMovieIds(loadFromStorage(STORAGE_KEYS.LIKED_MOVIES, []));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PREFERENCES, preferences);
  }, [preferences]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.LIKED_MOVIES, likedMovieIds);
  }, [likedMovieIds]);

  const updatePreferences = async (prefs: Partial<Preferences>) => {
    const newPrefs = { ...preferences, ...prefs };
    setPreferences(newPrefs);
    
    Logger.action('Preferences updated', {
      genre: newPrefs.genre,
      lengthBucket: newPrefs.lengthBucket
    });
    
    // Sync to backend in live mode
    if (API_MODE === 'live' && (newPrefs.genre || newPrefs.lengthBucket)) {
      try {
        await PreferencesService.savePreferences(newPrefs);
        Logger.api('POST', '/api/UserPreferences', { success: true });
      } catch (error) {
        Logger.error('Failed to sync preferences to backend', error);
      }
    }
  };

  const addLikedMovie = (movieId: string) => {
    if (!likedMovieIds.includes(movieId)) {
      Logger.action('Movie liked (added to local state)', { movieId });
    }
    setLikedMovieIds((prev) => (prev.includes(movieId) ? prev : [...prev, movieId]));
  };

  const resetPreferences = () => {
    Logger.action('Preferences reset');
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
