import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { authService, isAuthenticated as checkAuth, clearToken } from '@/services/authService';
import { notificationService } from '@/lib/services/NotificationService';
import { Logger } from '@/lib/logger';

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
      if (checkAuth()) {
        try {
          Logger.auth('Hydrating user from stored token...');
          // TODO: In LIVE mode, this validates the token by calling /api/MyInformation
          const userInfo = await authService.myInformation();
          
          const hydratedUser: User = {
            id: userInfo.userId,
            email: userInfo.email,
            displayName: userInfo.displayName,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo.email}`,
          };
          
          setUser(hydratedUser);
          setToken(localStorage.getItem('access_token'));
          
          Logger.auth('User hydrated successfully', {
            userId: hydratedUser.id,
            email: hydratedUser.email,
            displayName: hydratedUser.displayName
          });
          
          // Connect to notification service for real-time match notifications
          notificationService.connect().then((connected) => {
            if (connected) {
              Logger.notification('SignalR', 'Connected on app start');
              notificationService.requestPermission();
            }
          });
        } catch (error) {
          Logger.error('Failed to hydrate user', error);
          // Clear invalid token
          clearToken();
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (user: User, token: string) => {
    Logger.separator();
    Logger.auth('User logged in', {
      userId: user.id,
      email: user.email,
      displayName: user.displayName
    });
    
    setUser(user);
    setToken(token);
    localStorage.setItem('access_token', token);
    localStorage.setItem('cinematch_user', JSON.stringify(user));
    
    // Connect to notification service for real-time match notifications
    notificationService.connect().then((connected) => {
      if (connected) {
        Logger.notification('SignalR', 'Connected on login');
        // Request browser notification permission
        notificationService.requestPermission();
      }
    });
  };

  const logout = async () => {
    Logger.separator();
    Logger.auth('User logging out', { userId: user?.id, email: user?.email });
    
    // Disconnect from notification service
    await notificationService.disconnect();
    
    clearToken();
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
