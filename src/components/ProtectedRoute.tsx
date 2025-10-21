import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePreferences } from '@/context/PreferencesContext';
import { isAuthenticated } from '@/services/authService';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { loading } = useAuth();
  const { preferences } = usePreferences();
  const location = useLocation();

  if (loading) {
    return null; // Or a loading spinner
  }

  // TODO: In LIVE mode, this checks for the Bearer token from ASP.NET backend
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Routes that require onboarding to be completed
  const requiresOnboarding = ['/discover', '/match'].some(route => 
    location.pathname.startsWith(route)
  );

  if (requiresOnboarding && (!preferences.genre || !preferences.lengthBucket)) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
