import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePreferences } from '@/context/PreferencesContext';
import { useVisualFX } from '@/context/VisualFXProvider';
import { Movie } from '@/types';
import { MoviesService } from '@/lib/services/MoviesService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Heart, ArrowLeft, Film, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function LikedMovies() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { preferences, resetPreferences } = usePreferences();
  const { setPreset } = useVisualFX();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    setPreset('standard');
  }, [setPreset]);

  useEffect(() => {
    if (!user) return;
    
    loadLikedMovies();
  }, [user]);

  const loadLikedMovies = async () => {
    setLoading(true);
    try {
      const likedMovies = await MoviesService.getLikedMovies();
      setMovies(likedMovies);
      
      if (likedMovies.length === 0) {
        toast.info('You haven\'t liked any movies yet. Start discovering!');
      }
    } catch (error) {
      toast.error('Failed to load your liked movies');
      console.error('Failed to load liked movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    resetPreferences();
    toast.success('Preferences reset! Choose your genre and length again.');
    navigate('/onboarding');
  };

  const handleContinueDiscover = () => {
    if (preferences.genre && preferences.lengthBucket) {
      toast.success(`Finding ${preferences.genre} movies (${preferences.lengthBucket} length)`);
      navigate('/discover');
    } else {
      // User doesn't have preferences set, send to onboarding
      toast.info('Choose your preferences first');
      navigate('/onboarding');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="relative z-10 text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-lg text-muted-foreground">Loading your liked movies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden pt-20 pb-12">
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl font-display font-semibold flex items-center gap-3">
                  <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                  Your Liked Movies
                </h1>
                <p className="text-muted-foreground">
                  {movies.length === 0 
                    ? 'No liked movies yet' 
                    : `${movies.length} movie${movies.length === 1 ? '' : 's'} you've liked`}
                </p>
                {preferences.genre && preferences.lengthBucket && (
                  <p className="text-sm text-muted-foreground">
                    Current preferences: <span className="font-semibold">{preferences.genre}</span> · <span className="font-semibold">{preferences.lengthBucket}</span> length
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="font-semibold">What would you like to do?</h3>
                    <p className="text-sm text-muted-foreground">
                      {preferences.genre && preferences.lengthBucket 
                        ? `Continue with ${preferences.genre} · ${preferences.lengthBucket} length, or choose new preferences`
                        : 'Set your preferences to start discovering movies, or browse your liked movies'
                      }
                    </p>
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    <Button 
                      onClick={handleContinueDiscover} 
                      size="lg" 
                      className="gap-2"
                      disabled={!preferences.genre || !preferences.lengthBucket}
                    >
                      <Film className="w-4 h-4" />
                      {preferences.genre && preferences.lengthBucket ? 'Continue Discovering' : 'Set Preferences First'}
                    </Button>
                    <Button 
                      onClick={() => setShowResetModal(true)} 
                      variant="outline" 
                      size="lg" 
                      className="gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      {preferences.genre && preferences.lengthBucket ? 'Reset Preferences' : 'Choose New Preferences'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Movies Grid */}
          {movies.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-12 text-center space-y-4">
                <Heart className="w-16 h-16 text-muted-foreground/50 mx-auto" />
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">No liked movies yet</h3>
                  <p className="text-muted-foreground">
                    Start swiping to find movies you'll love!
                  </p>
                </div>
                <Button onClick={() => navigate('/discover')} className="mt-4">
                  Start Discovering
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {movies.map((movie) => (
                <Card 
                  key={movie.id} 
                  className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all cursor-pointer"
                  onClick={() => {
                    // Could navigate to a movie detail page in the future
                    toast(`${movie.title} (${movie.year})`);
                  }}
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-[2/3] overflow-hidden">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
                          <h3 className="font-semibold text-white text-sm line-clamp-2">
                            {movie.title}
                          </h3>
                          <p className="text-white/80 text-xs">{movie.year}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal 
        open={showResetModal} 
        onOpenChange={setShowResetModal} 
        title="Reset preferences?" 
        description="This will clear your genre and length preferences. Your liked movies will be saved. You'll be taken to onboarding to choose new preferences." 
        confirmText="Reset" 
        variant="destructive" 
        onConfirm={handleReset} 
      />
    </div>
  );
}
