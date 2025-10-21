import { api } from '@/lib/api';
import { AuthResponse, User } from '@/types';

interface SignUpRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  displayName: string;
}

interface SignInRequest {
  email: string;
  password: string;
}

interface AuthApiResponse {
  token: string;
  userId: string;
  email: string;
  displayName: string;
}

interface MyInformationResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
}

export class AuthService {
  static async signUp(data: SignUpRequest): Promise<AuthResponse> {
    const response = await api.post<AuthApiResponse>('/api/SignUp', data);
    
    const user: User = {
      id: response.data.userId,
      email: response.data.email,
      displayName: response.data.displayName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.data.email}`,
    };

    return {
      user,
      token: response.data.token,
    };
  }

  static async signIn(data: SignInRequest): Promise<AuthResponse> {
    const response = await api.post<AuthApiResponse>('/api/SignIn', data);
    
    const user: User = {
      id: response.data.userId,
      email: response.data.email,
      displayName: response.data.displayName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.data.email}`,
    };

    return {
      user,
      token: response.data.token,
    };
  }

  static async getMyInformation(): Promise<MyInformationResponse> {
    const response = await api.get<MyInformationResponse>('/api/MyInformation');
    return response.data;
  }

  static async logout(): Promise<void> {
    // Clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('cinematch_user');
    localStorage.removeItem('cinematch_preferences');
    localStorage.removeItem('cinematch_liked_movies');
  }

  // Legacy methods for backwards compatibility (mock mode)
  static async register(
    email: string,
    password: string,
    displayName: string
  ): Promise<AuthResponse> {
    // Redirect to new signUp method
    return this.signUp({
      email,
      password,
      displayName,
      firstName: displayName.split(' ')[0] || displayName,
      lastName: displayName.split(' ')[1] || '',
    });
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    // Redirect to new signIn method
    return this.signIn({ email, password });
  }
}
