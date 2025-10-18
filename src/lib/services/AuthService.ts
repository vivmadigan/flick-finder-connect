import { AuthResponse, User } from '@/types';

// TODO: Replace with actual API calls to your ASP.NET Web API
// Endpoints:
// - POST /api/auth/register - { email, password, displayName }
// - POST /api/auth/login - { email, password }
// - POST /api/auth/logout - with Bearer token
// - GET /api/auth/me - get current user with Bearer token

export class AuthService {
  static async register(
    email: string,
    password: string,
    displayName: string
  ): Promise<AuthResponse> {
    // Mock implementation
    console.log('[MOCK] Registering user:', email);
    
    // TODO: Replace with actual API call
    // const response = await api.post('/api/auth/register', { email, password, displayName });
    // return response.data;
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser: User = {
          id: `user-${Date.now()}`,
          email,
          displayName,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        };
        resolve({
          user: mockUser,
          token: `mock-token-${Date.now()}`,
        });
      }, 500);
    });
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    // Mock implementation
    console.log('[MOCK] Logging in user:', email);
    
    // TODO: Replace with actual API call
    // const response = await api.post('/api/auth/login', { email, password });
    // return response.data;
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser: User = {
          id: `user-${Date.now()}`,
          email,
          displayName: email.split('@')[0],
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        };
        resolve({
          user: mockUser,
          token: `mock-token-${Date.now()}`,
        });
      }, 500);
    });
  }

  static async logout(): Promise<void> {
    // Mock implementation
    console.log('[MOCK] Logging out user');
    
    // TODO: Replace with actual API call
    // await api.post('/api/auth/logout');
    
    return Promise.resolve();
  }
}
