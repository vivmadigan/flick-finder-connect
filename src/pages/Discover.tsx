import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePreferences } from '@/context/PreferencesContext';
import { Movie } from '@/types';
import { MoviesService } from '@/lib/services/MoviesService';
import { MovieCard } from '@/features/discover/MovieCard';
import { BokehBackdrop } from '@/components/BokehBackdrop';
import { BokehOrbs } from '@/components/BokehOrbs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
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
  const { preferences } = usePreferences();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [likedMovieIds, setLikedMovieIds] = useState<string[]>([]);
  const [hasLikedInCurrentBatch, setHasLikedInCurrentBatch] = useState(false);

  useEffect(() => {
    loadMovies();
  }, [skip]);

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
      console.error('Failed to load movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (movie: Movie) => {
    if (!user) return;
    
    try {
      await MoviesService.likeMovie(user.id, movie.id);
      setLikedMovieIds((prev) => [...prev, movie.id]);
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

  const handleLoadMore = () => {
    setSkip((prev) => prev + BATCH_SIZE);
  };

  const handleStopChoosing = () => {
    if (likedMovieIds.length === 0) return;
    navigate('/match', { state: { likedMovieIds } });
  };

  const canStopChoosing = likedMovieIds.length > 0 && hasLikedInCurrentBatch;

  return (
    <div className="min-h-screen relative overflow-hidden pt-20">
      <BokehBackdrop />
      <BokehOrbs />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Pick movies you'd watch tonight</h1>
            <p className="text-muted-foreground">
              {likedMovieIds.length > 0
                ? `You've liked ${likedMovieIds.length} ${likedMovieIds.length === 1 ? 'movie' : 'movies'} so far`
                : 'Like at least one movie to find matches'}
            </p>
          </div>

          {loading && movies.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: BATCH_SIZE }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[2/3] w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {movies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onLike={() => handleLike(movie)}
                    onSkip={() => handleSkip(movie)}
                    disabled={loading}
                  />
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Show 10 more
                </Button>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button
                          size="lg"
                          onClick={handleStopChoosing}
                          disabled={!canStopChoosing || loading}
                        >
                          Stop choosing movies
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {!canStopChoosing && (
                      <TooltipContent>
                        <p>Like at least one movie from this batch to continue</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
