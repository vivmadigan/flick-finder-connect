import { Match, Movie, User, Preferences } from '@/types';
import { api } from '@/lib/api';
import { API_MODE } from '@/services/apiMode';

// MatchService: MOCK/LIVE pattern
// MOCK mode: uses in-memory mock data
// LIVE mode: calls ASP.NET backend endpoints

const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    email: 'alex@example.com',
    displayName: 'Alex',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
  },
  {
    id: 'user-2',
    email: 'taylor@example.com',
    displayName: 'Taylor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=taylor',
  },
  {
    id: 'user-3',
    email: 'jordan@example.com',
    displayName: 'Jordan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan',
  },
  {
    id: 'user-4',
    email: 'casey@example.com',
    displayName: 'Casey',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=casey',
  },
  {
    id: 'user-5',
    email: 'morgan@example.com',
    displayName: 'Morgan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=morgan',
  },
];

export class MatchService {
  static async findMatches(
    userId: string,
    likedMovieIds: string[],
    preferences: Preferences,
    allMovies: Movie[]
  ): Promise<Match[]> {
    if (API_MODE === 'live') {
      console.log('[LIVE] Finding matches from backend:', { userId, likedMovieIds, preferences });
      try {
        // Your backend uses /api/Matches/candidates
        const response = await api.get('/api/Matches/candidates');
        return response.data;
      } catch (error) {
        console.error('[LIVE] Failed to find matches:', error);
        throw error;
      }
    }
    
    // MOCK mode
    console.log('[MOCK] Finding matches:', { userId, likedMovieIds, preferences });
    return new Promise((resolve) => {
      setTimeout(() => {
        const matches: Match[] = [];
        const numMatches = Math.min(3, MOCK_USERS.length);
        
        for (let i = 0; i < numMatches; i++) {
          const mockUser = MOCK_USERS[i];
          
          const numShared = Math.min(2, likedMovieIds.length);
          const sharedMovieIds = likedMovieIds
            .sort(() => Math.random() - 0.5)
            .slice(0, numShared);
          
          const sharedMovies = allMovies.filter((m) =>
            sharedMovieIds.includes(m.id)
          );
          
          if (sharedMovies.length > 0) {
            matches.push({
              id: `match-${Date.now()}-${i}`,
              user: mockUser,
              sharedMovies,
              status: 'pending',
              createdAt: new Date(),
            });
          }
        }
        
        resolve(matches);
      }, 800);
    });
  }

  static async respondToMatch(
    matchId: string,
    userId: string,
    accepted: boolean
  ): Promise<{ roomId?: string; bothAccepted: boolean }> {
    if (API_MODE === 'live') {
      console.log('[LIVE] Responding to match from backend:', { matchId, userId, accepted });
      try {
        // Your backend uses /api/Matches/request with movieId
        // This might need adjustment based on your actual backend implementation
        const response = await api.post('/api/Matches/request', { 
          matchId, 
          accepted 
        });
        return response.data;
      } catch (error) {
        console.error('[LIVE] Failed to respond to match:', error);
        throw error;
      }
    }
    
    // MOCK mode
    console.log('[MOCK] Responding to match:', { matchId, userId, accepted });
    return new Promise((resolve) => {
      setTimeout(() => {
        if (accepted) {
          const roomId = `room-${Date.now()}`;
          resolve({ roomId, bothAccepted: true });
        } else {
          resolve({ bothAccepted: false });
        }
      }, 500);
    });
  }
}
