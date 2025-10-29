import { api } from '@/lib/api';
import { API_MODE } from '@/services/apiMode';
import { Preferences, PreferencesDTO, Genre } from '@/types';

// Genre name to TMDB ID mapping (must match MoviesService)
const GENRE_NAME_TO_ID: Record<Genre, string> = {
  'Action': '28',
  'Comedy': '35',
  'Drama': '18',
  'Romance': '10749',
  'Thriller': '53',
  'Horror': '27',
  'Sci-Fi': '878',
  'Fantasy': '14',
  'Animated': '16',
  'Documentary': '99',
  'Crime': '80',
  '80s': '80s',
  '90s': '90s',
  'Western': '37',
  'Feel-good': 'feel-good',
  'Academy Award Winners': 'academy',
  'Cult Classics': 'cult'
};

const GENRE_ID_TO_NAME: Record<string, Genre> = Object.fromEntries(
  Object.entries(GENRE_NAME_TO_ID).map(([name, id]) => [id, name as Genre])
);

export class PreferencesService {
  // Transform frontend format to backend format
  private static toDTO(preferences: Preferences): PreferencesDTO {
    const genreId = preferences.genre ? GENRE_NAME_TO_ID[preferences.genre] : undefined;
    
    return {
      genreIds: genreId ? [parseInt(genreId)] : [],
      length: preferences.lengthBucket || 'medium'
    };
  }

  // Transform backend format to frontend format
  private static fromDTO(dto: PreferencesDTO): Preferences {
    const firstGenreId = dto.genreIds?.[0]?.toString();
    const genre = firstGenreId ? GENRE_ID_TO_NAME[firstGenreId] : undefined;
    
    return {
      genre,
      lengthBucket: (dto.length as 'short' | 'medium' | 'long') || 'medium'
    };
  }

  static async savePreferences(preferences: Preferences): Promise<void> {
    if (API_MODE === 'live') {
      console.log('[LIVE] Saving preferences to backend (frontend format):', preferences);
      const dto = this.toDTO(preferences);
      console.log('[LIVE] Transformed to backend format:', dto);
      
      try {
        await api.post('/api/preferences', dto);
        console.log('[LIVE] Preferences saved successfully');
      } catch (error) {
        console.error('[LIVE] Failed to save preferences:', error);
        throw error;
      }
      return;
    }
    
    // MOCK mode
    console.log('[MOCK] Saving preferences:', preferences);
    return Promise.resolve();
  }

  static async getPreferences(): Promise<Preferences | null> {
    if (API_MODE === 'live') {
      console.log('[LIVE] Getting preferences from backend');
      try {
        const response = await api.get('/api/preferences');
        console.log('[LIVE] Received preferences (backend format):', response.data);
        
        const dto = response.data as PreferencesDTO;
        
        // Backend always returns data (with defaults if none saved)
        // Check if user has actually set preferences
        if (!dto.genreIds || dto.genreIds.length === 0) {
          console.log('[LIVE] No preferences set (empty genreIds)');
          return null;
        }
        
        const preferences = this.fromDTO(dto);
        console.log('[LIVE] Transformed to frontend format:', preferences);
        return preferences;
      } catch (error) {
        console.error('[LIVE] Failed to get preferences:', error);
        return null;
      }
    }
    
    // MOCK mode
    console.log('[MOCK] Getting preferences');
    return null;
  }

  static async deletePreferences(): Promise<void> {
    if (API_MODE === 'live') {
      console.log('[LIVE] Deleting preferences from backend');
      try {
        await api.delete('/api/preferences');
        console.log('[LIVE] Preferences deleted successfully');
      } catch (error) {
        console.error('[LIVE] Failed to delete preferences:', error);
        throw error;
      }
      return;
    }
    
    // MOCK mode
    console.log('[MOCK] Deleting preferences');
    return Promise.resolve();
  }
}
