import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePreferences } from '@/context/PreferencesContext';
import { useVisualFX } from '@/context/VisualFXProvider';
import { Movie } from '@/types';
import { MoviesService } from '@/lib/services/MoviesService';
import { SingleMovieCard } from '@/components/discover/SingleMovieCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { DecisionPromptModal } from '@/components/ui/DecisionPromptModal';
import { FindMatchModal } from '@/components/ui/FindMatchModal';
import { toast } from 'sonner';
import { Loader2, RotateCcw } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AnimatePresence } from 'framer-motion';

const PROMPT_INTERVAL = 5;

export default function Discover() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { preferences, likedMovieIds, addLikedMovie, resetPreferences } = usePreferences();
  const { setPreset } = useVisualFX();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [decisionCount, setDecisionCount] = useState(0);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDecisionPrompt, setShowDecisionPrompt] = useState(false);
  const [showFindMatchModal, setShowFindMatchModal] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  console.log('[Discover] Component mounted/rendered');
  console.log('[Discover] User:', user);
  console.log('[Discover] Preferences:', preferences);
  console.log('[Discover] Movies count:', movies.length);
  console.log('[Discover] Loading:', loading);

  useEffect(() => {
    console.log('[Discover] Setting visual preset...');
    setPreset('dense');
  }, [setPreset]);

  useEffect(() => {
    console.log('[Discover] Checking preferences for redirect...');
    console.log('[Discover] Genre:', preferences.genre, 'LengthBucket:', preferences.lengthBucket);
    if (!preferences.genre || !preferences.lengthBucket) {
      console.log('[Discover] Missing preferences, redirecting to onboarding');
      toast.error('Please complete onboarding first');
      navigate('/onboarding');
    } else {
      console.log('[Discover] Preferences OK, staying on discover page');
    }
  }, [preferences, navigate]);

  useEffect(() => {
    console.log('[Discover] Preferences changed, checking if should load movies...');
    console.log('[Discover] Genre:', preferences.genre, 'LengthBucket:', preferences.lengthBucket);
    if (preferences.genre && preferences.lengthBucket) {
      console.log('[Discover] Calling loadInitialMovies...');
      loadInitialMovies();
    } else {
      console.log('[Discover] Skipping loadInitialMovies - missing preferences');
    }
  }, [preferences.genre, preferences.lengthBucket]);

  // Load from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('cinematch_discover_progress');
    if (savedProgress) {
      try {
        const { currentIndex: savedIndex, decisionCount: savedCount } = JSON.parse(savedProgress);
        setCurrentIndex(savedIndex || 0);
        setDecisionCount(savedCount || 0);
      } catch (e) {
        console.error('Failed to load progress:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('cinematch_discover_progress', JSON.stringify({ currentIndex, decisionCount }));
  }, [currentIndex, decisionCount]);

  // Check if we should show the decision prompt
  useEffect(() => {
    if (decisionCount > 0 && decisionCount % PROMPT_INTERVAL === 0) {
      setShowDecisionPrompt(true);
      console.log('[Analytics] Five-pick-prompt-shown', { decisionCount, likedCount: likedMovieIds.length });
    }
  }, [decisionCount]);

  const loadInitialMovies = async () => {
    console.log('[Discover] Starting loadInitialMovies...');
    console.log('[Discover] Current preferences:', preferences);
    
    if (!preferences.genre || !preferences.lengthBucket) {
      console.error('[Discover] Missing preferences!', preferences);
      toast.error('Missing preferences. Redirecting to onboarding...');
      navigate('/onboarding');
      return;
    }
    
    setLoading(true);
    try {
      console.log('[Discover] Loading movies with:', { 
        genre: preferences.genre, 
        lengthBucket: preferences.lengthBucket 
      });
      
      const allMovies = await MoviesService.getMovies(
        preferences.genre,
        preferences.lengthBucket,
        0,
        100
      );
      
      console.log('[Discover] Loaded movies:', allMovies);
      console.log('[Discover] Movies count:', allMovies.length);
      console.log('[Discover] Already liked movie IDs:', likedMovieIds);
      
      // Filter out already-liked movies
      const unlikedMovies = allMovies.filter(movie => !likedMovieIds.includes(movie.id));
      console.log('[Discover] Filtered to unliked movies:', unlikedMovies.length);
      
      setMovies(unlikedMovies);
      
      if (unlikedMovies.length === 0) {
        toast.info('No new movies found. You\'ve seen them all! Try changing your preferences.');
      } else {
        toast.success(`Loaded ${unlikedMovies.length} new movies!`);
      }
    } catch (error) {
      console.error('[Discover] Failed to load movies:', error);
      toast.error('Failed to load movies. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMovies = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const moreMovies = await MoviesService.getMovies(
        preferences.genre,
        preferences.lengthBucket,
        movies.length,
        50
      );
      
      // Filter out already-liked movies
      const unlikedMovies = moreMovies.filter(movie => !likedMovieIds.includes(movie.id));
      setMovies(prev => [...prev, ...unlikedMovies]);
    } catch (error) {
      toast.error('Failed to load more movies');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = useCallback(async (action: 'like' | 'skip') => {
    if (!user || processingAction || currentIndex >= movies.length) return;
    
    setProcessingAction(true);
    const movie = movies[currentIndex];
    
    try {
      if (action === 'like') {
        console.log('[Discover] Liking movie:', movie);
        await MoviesService.likeMovie(user.id, movie.id, {
          title: movie.title,
          poster: movie.poster,
          year: movie.year
        });
        addLikedMovie(movie.id);
        toast.success(`Want to watch ${movie.title}`);
        console.log('[Analytics] Like', { movieId: movie.id, title: movie.title });
        
        // Check if user has liked 5+ movies, show find match modal
        if (likedMovieIds.length + 1 >= 5 && !showFindMatchModal) {
          setShowFindMatchModal(true);
        }
      } else {
        console.log('[Discover] Skipping movie:', movie);
        await MoviesService.skipMovie(user.id, movie.id);
        console.log('[Analytics] Skip', { movieId: movie.id, title: movie.title });
      }
      
      setDecisionCount(prev => prev + 1);
      
      // Move to next movie
      if (currentIndex < movies.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Need more movies
        await loadMoreMovies();
        setCurrentIndex(prev => prev + 1);
      }
    } catch (error) {
      toast.error(`Failed to ${action} movie`);
      console.error(`Failed to ${action} movie:`, error);
    } finally {
      setProcessingAction(false);
    }
  }, [user, currentIndex, movies, processingAction, addLikedMovie, likedMovieIds.length, showFindMatchModal]);

  const handleLike = useCallback(() => handleAction('like'), [handleAction]);
  const handleSkip = useCallback(() => handleAction('skip'), [handleAction]);

  const handleFindMatches = () => {
    if (likedMovieIds.length === 0) return;
    console.log('[Analytics] Find-match-clicked', { likedCount: likedMovieIds.length, decisionCount });
    navigate('/match', { state: { likedMovieIds } });
  };

  const handleSeeMore = () => {
    setShowDecisionPrompt(false);
    console.log('[Analytics] See-more-clicked', { decisionCount });
  };

  const handleReset = () => {
    resetPreferences();
    localStorage.removeItem('cinematch_discover_progress');
    setShowResetModal(false);
    toast.success('Preferences reset');
    console.log('[Analytics] Reset');
    navigate('/onboarding');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (processingAction || showDecisionPrompt || showResetModal) return;
      
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleLike();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleLike, handleSkip, processingAction, showDecisionPrompt, showResetModal]);

  const currentMovie = movies[currentIndex];

  return (
    <div className="min-h-screen relative pt-20">
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-start justify-between gap-4">
            <div className="text-center flex-1 space-y-2">
              <h1 className="text-4xl font-display font-semibold">Pick movies you'd watch tonight</h1>
              <p className="text-muted-foreground">
                {likedMovieIds.length > 0 
                  ? `${likedMovieIds.length} liked · ${decisionCount > 0 ? `${decisionCount} reviewed` : 'Keep going!'}`
                  : 'Like at least one movie to find matches'}
              </p>
              {decisionCount < 5 && decisionCount > 0 && (
                <p className="text-sm text-muted-foreground">{decisionCount} / 5</p>
              )}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowResetModal(true)}
                    className="rounded-2xl"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset & Rechoose
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Start over and pick again</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {loading && movies.length === 0 ? (
            <div className="flex justify-center">
              <div className="w-full max-w-md space-y-4">
                <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
                <Skeleton className="h-6 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ) : !currentMovie ? (
            <div className="text-center space-y-6 py-12">
              <p className="text-lg text-muted-foreground">No more movies match your filters.</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => navigate('/onboarding')} className="rounded-2xl">
                  Change filters
                </Button>
                <Button onClick={() => window.location.reload()} className="rounded-2xl">
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <SingleMovieCard
                key={currentMovie.id}
                movie={currentMovie}
                onLike={handleLike}
                onSkip={handleSkip}
                disabled={processingAction}
              />
            </AnimatePresence>
          )}

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Keyboard: <kbd className="px-2 py-1 bg-muted rounded">Enter</kbd> or <kbd className="px-2 py-1 bg-muted rounded">Space</kbd> to like · <kbd className="px-2 py-1 bg-muted rounded">S</kbd> to skip
            </p>
            {likedMovieIds.length > 0 && (
              <p className="text-xs text-muted-foreground">
                You've liked {likedMovieIds.length} movie{likedMovieIds.length === 1 ? '' : 's'} · 
                <button 
                  onClick={() => navigate('/liked-movies')} 
                  className="ml-1 underline hover:text-primary transition-colors"
                >
                  View all
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal 
        open={showResetModal} 
        onOpenChange={setShowResetModal} 
        title="Reset preferences?" 
        description="This clears your genre, length, and liked movies so you can choose again." 
        confirmText="Reset" 
        variant="destructive" 
        onConfirm={handleReset} 
      />

      <DecisionPromptModal
        open={showDecisionPrompt}
        onOpenChange={setShowDecisionPrompt}
        decisionCount={decisionCount}
        likedCount={likedMovieIds.length}
        onSeeMore={handleSeeMore}
        onFindMatches={handleFindMatches}
      />

      <FindMatchModal
        open={showFindMatchModal}
        onOpenChange={setShowFindMatchModal}
        onContinue={() => {
          // Just close modal and continue swiping
          console.log('[Analytics] Continue-discovering-clicked');
        }}
        onFindMatch={() => {
          console.log('[Analytics] Find-cinematch-clicked', { likedCount: likedMovieIds.length });
          navigate('/match');
        }}
        moviesLikedCount={likedMovieIds.length}
      />
    </div>
  );
}
