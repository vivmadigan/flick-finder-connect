import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePreferences } from '@/context/PreferencesContext';
import { useVisualFX } from '@/context/VisualFXProvider';
import { Movie } from '@/types';
import { MoviesService } from '@/lib/services/MoviesService';
import { MovieCard } from '@/features/discover/MovieCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { toast } from 'sonner';
import { Loader2, RotateCcw } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const BATCH_SIZE = 10;

export default function Discover() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { preferences, likedMovieIds, addLikedMovie, resetPreferences } = usePreferences();
  const { setPreset } = useVisualFX();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasLikedInCurrentBatch, setHasLikedInCurrentBatch] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    setPreset('dense');
  }, [setPreset]);

  useEffect(() => {
    if (!preferences.genre || !preferences.lengthBucket) {
      toast.error('Please complete onboarding first');
      navigate('/onboarding');
    }
  }, [preferences, navigate]);

  useEffect(() => {
    if (preferences.genre && preferences.lengthBucket) {
      loadMovies();
    }
  }, [skip, preferences]);

  const loadMovies = async () => {
    setLoading(true);
    try {
      const newMovies = await MoviesService.getMovies(
        preferences.genre,
        preferences.lengthBucket,
        skip,
        BATCH_SIZE
      );
      setMovies(newMovies);
      setHasLikedInCurrentBatch(false);
    } catch (error) {
      toast.error('Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (movie: Movie) => {
    if (!user) return;
    try {
      await MoviesService.likeMovie(user.id, movie.id);
      addLikedMovie(movie.id);
      setHasLikedInCurrentBatch(true);
      toast.success(`Liked ${movie.title}`);
    } catch (error) {
      toast.error('Failed to like movie');
    }
  };

  const handleSkip = async (movie: Movie) => {
    if (!user) return;
    try {
      await MoviesService.skipMovie(user.id, movie.id);
      toast('Skipped', { duration: 1000 });
    } catch (error) {
      console.error('Failed to skip movie:', error);
    }
  };

  const handleStopChoosing = () => {
    if (likedMovieIds.length === 0) return;
    navigate('/match', { state: { likedMovieIds } });
  };

  const handleReset = () => {
    resetPreferences();
    setShowResetModal(false);
    toast.success('Preferences reset');
    navigate('/onboarding');
  };

  const canStopChoosing = likedMovieIds.length > 0 && hasLikedInCurrentBatch;

  return (
    <div className="min-h-screen relative pt-20">
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-start justify-between gap-4">
            <div className="text-center flex-1 space-y-2">
              <h1 className="text-4xl font-display font-semibold">Pick movies you'd watch tonight</h1>
              <p className="text-muted-foreground">
                {likedMovieIds.length > 0 ? `${likedMovieIds.length} liked` : 'Like at least one movie to find matches'}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowResetModal(true)}><RotateCcw className="w-4 h-4" /></Button>
          </div>

          {loading && movies.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: BATCH_SIZE }).map((_, i) => (
                <div key={i} className="space-y-4"><Skeleton className="aspect-[2/3] w-full rounded-2xl" /><Skeleton className="h-4 w-3/4" /></div>
              ))}
            </div>
          ) : movies.length === 0 ? (
            <div className="text-center space-y-6 py-12">
              <p className="text-lg text-muted-foreground">No more movies match your filters.</p>
              <Button onClick={() => setSkip(0)}>Retry</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {movies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} onLike={() => handleLike(movie)} onSkip={() => handleSkip(movie)} disabled={loading} />
                ))}
              </div>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" size="lg" onClick={() => setSkip(p => p + BATCH_SIZE)} disabled={loading} className="rounded-2xl">
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Show 10 more
                </Button>
                <TooltipProvider><Tooltip><TooltipTrigger asChild><div><Button size="lg" onClick={handleStopChoosing} disabled={!canStopChoosing || loading} className="rounded-2xl">Find Matches</Button></div></TooltipTrigger>{!canStopChoosing && <TooltipContent><p>Like at least one movie from this batch</p></TooltipContent>}</Tooltip></TooltipProvider>
              </div>
            </>
          )}
        </div>
      </div>
      <ConfirmModal open={showResetModal} onOpenChange={setShowResetModal} title="Reset preferences?" description="This clears your genre, length, and liked movies." confirmText="Reset" variant="destructive" onConfirm={handleReset} />
    </div>
  );
}
