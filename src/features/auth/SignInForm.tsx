import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { usePreferences } from '@/context/PreferencesContext';
import { authService, saveToken } from '@/services/authService';
import { PreferencesService } from '@/lib/services/PreferencesService';
import { MoviesService } from '@/lib/services/MoviesService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function SignInForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { updatePreferences } = usePreferences();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sign in to backend
      const response = await authService.signIn({
        email: formData.email,
        password: formData.password,
      });

      saveToken(response.token);
      
      const user = {
        id: response.userId,
        email: response.email,
        displayName: response.displayName,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.email}`,
      };
      
      login(user, response.token);
      
      // Clear any previous user's preferences from localStorage
      localStorage.removeItem('cinematch_preferences');
      localStorage.removeItem('cinematch_liked_movies');
      localStorage.removeItem('cinematch_discover_progress');
      
      toast.success('Welcome back!');
      
      // Try to load preferences from backend
      try {
        const savedPreferences = await PreferencesService.getPreferences();
        console.log('[SignIn] Loaded preferences from backend:', savedPreferences);
        console.log('[SignIn] Preference check:', {
          hasPreferences: !!savedPreferences,
          genre: savedPreferences?.genre,
          lengthBucket: savedPreferences?.lengthBucket,
          genreExists: savedPreferences && 'genre' in savedPreferences,
          lengthExists: savedPreferences && 'lengthBucket' in savedPreferences
        });
        
        // Check if user has EITHER valid preferences OR liked movies
        if (savedPreferences && savedPreferences.genre && savedPreferences.lengthBucket) {
          // User has complete preferences, update local state
          localStorage.setItem('cinematch_preferences', JSON.stringify(savedPreferences));
          updatePreferences(savedPreferences);
          console.log('[SignIn] User has preferences, navigating to /discover');
          navigate('/discover');
        } else if (savedPreferences && (savedPreferences.genre || savedPreferences.lengthBucket)) {
          // User has partial preferences (this shouldn't happen but handle it)
          localStorage.setItem('cinematch_preferences', JSON.stringify(savedPreferences));
          updatePreferences(savedPreferences);
          console.log('[SignIn] User has partial preferences, navigating to /onboarding to complete');
          navigate('/onboarding');
        } else {
          // No preferences at all - check if they have liked movies
          console.log('[SignIn] No preferences found, checking for liked movies...');
          try {
            const likedMovies = await MoviesService.getLikedMovies();
            if (likedMovies && likedMovies.length > 0) {
              // User has liked movies but no saved preferences - go to liked movies page
              console.log('[SignIn] User has liked movies but no preferences, navigating to /liked-movies');
              navigate('/liked-movies');
            } else {
              // New user - go to onboarding
              console.log('[SignIn] New user, navigating to /onboarding');
              navigate('/onboarding');
            }
          } catch (error) {
            // If we can't fetch liked movies, go to onboarding
            console.log('[SignIn] Could not fetch liked movies, navigating to /onboarding');
            navigate('/onboarding');
          }
        }
      } catch (error) {
        // If preferences fetch fails, go to onboarding to be safe
        console.log('[SignIn] Error loading preferences, redirecting to onboarding:', error);
        navigate('/onboarding');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      
      if (errorMessage.includes('401')) {
        toast.error('Invalid email or password');
      } else if (errorMessage.includes('400')) {
        toast.error('Please check your email and password');
      } else {
        toast.error('Sign in failed. Please try again.');
      }
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md backdrop-blur-glass border-border/50 rounded-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-display">Welcome back</CardTitle>
        <CardDescription>Log in to find your perfect movie date</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="rounded-2xl"
            />
          </div>

          <Button type="submit" className="w-full rounded-2xl" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Log in
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <p className="text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
