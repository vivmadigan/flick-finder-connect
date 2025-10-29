import { api } from '@/lib/api';
import { API_MODE } from '@/services/apiMode';
import { Preferences } from '@/types';

export class PreferencesService {
  static async savePreferences(preferences: Preferences): Promise<void> {
    if (API_MODE === 'live') {
      console.log('[LIVE] Saving preferences to backend:', preferences);
      try {
        await api.post('/api/Preferences', preferences);
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
        const response = await api.get('/api/Preferences');
        console.log('[LIVE] Received preferences:', response.data);
        return response.data;
      } catch (error) {
        // 404 means no preferences saved yet - this is normal for new users
        if ((error as { response?: { status?: number } }).response?.status === 404) {
          console.log('[LIVE] No preferences found (404) - new user');
          return null;
        }
        console.error('[LIVE] Failed to get preferences:', error);
        return null;
      }
    }
    
    // MOCK mode
    console.log('[MOCK] Getting preferences');
    return null;
  }
}
