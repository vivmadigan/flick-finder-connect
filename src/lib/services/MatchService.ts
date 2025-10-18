import { Match, Movie, User, Preferences } from '@/types';

// TODO: Replace with actual API calls to your ASP.NET Web API
// Endpoints:
// - POST /api/matches/find - { userId, likedMovieIds, preferences }
// - POST /api/matches/respond - { matchId, userId, accepted: boolean }
// - GET /api/matches/{userId} - get all matches for a user

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
    console.log('[MOCK] Finding matches:', { userId, likedMovieIds, preferences });
    
    // TODO: Replace with actual API call and server-side matching logic
    // const response = await api.post('/api/matches/find', { userId, likedMovieIds, preferences });
    // return response.data;
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simple client-side mock: create 2-3 matches with random users
        const matches: Match[] = [];
        const numMatches = Math.min(3, MOCK_USERS.length);
        
        for (let i = 0; i < numMatches; i++) {
          const mockUser = MOCK_USERS[i];
          
          // Pick 1-2 random liked movies as "shared"
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
    console.log('[MOCK] Responding to match:', { matchId, userId, accepted });
    
    // TODO: Replace with actual API call
    // const response = await api.post('/api/matches/respond', { matchId, userId, accepted });
    // return response.data;
    
    return new Promise((resolve) => {
      setTimeout(() => {
        if (accepted) {
          // Mock: assume other side also accepted
          const roomId = `room-${Date.now()}`;
          resolve({ roomId, bothAccepted: true });
        } else {
          resolve({ bothAccepted: false });
        }
      }, 500);
    });
  }
}
