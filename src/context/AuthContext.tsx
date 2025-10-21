import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { AuthService } from '@/lib/services/AuthService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate user on app start
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      
      if (storedToken) {
        try {
          const userInfo = await AuthService.getMyInformation();
          
          const hydratedUser: User = {
            id: userInfo.userId,
            email: userInfo.email,
            displayName: userInfo.displayName,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo.email}`,
          };
          
          setUser(hydratedUser);
          setToken(storedToken);
        } catch (error) {
          console.error('Failed to hydrate user:', error);
          // Clear invalid token
          localStorage.removeItem('access_token');
          localStorage.removeItem('cinematch_user');
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('access_token', token);
    localStorage.setItem('cinematch_user', JSON.stringify(user));
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
