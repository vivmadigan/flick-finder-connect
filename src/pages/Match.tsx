import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePreferences } from '@/context/PreferencesContext';
import { useVisualFX } from '@/context/VisualFXProvider';
import { Match as MatchType, Movie } from '@/types';
import { MatchService } from '@/lib/services/MatchService';
import { MoviesService } from '@/lib/services/MoviesService';
import { MatchCard } from '@/features/match/MatchCard';
import { Button } from '@/components/ui/button';
import { Loader2, PartyPopper } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function Match() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { preferences } = usePreferences();
  const { setPreset } = useVisualFX();
  const [matches, setMatches] = useState<MatchType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);

  const likedMovieIds: string[] = location.state?.likedMovieIds || [];

  useEffect(() => {
    setPreset('standard');
  }, [setPreset]);

  useEffect(() => {
    if (likedMovieIds.length === 0) {
      navigate('/discover');
      return;
    }
    
    findMatches();
  }, []);

  const findMatches = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('[Match] Finding matches with preferences:', preferences);
      
      // Load all movies to pass to match service - preserve user's preferences
      const movies = await MoviesService.getMovies(
        preferences.genre,
        preferences.lengthBucket,
        0,
        100
      );
      setAllMovies(movies);
      
      console.log('[Match] Loaded movies for matching:', movies.length);
      
      const foundMatches = await MatchService.findMatches(
        user.id,
        likedMovieIds,
        preferences,
        movies
      );
      
      console.log('[Match] Found matches:', foundMatches.length);
      setMatches(foundMatches);
      
      if (foundMatches.length === 0) {
        toast.info('No matches yet! Your likes are saved. Come back later when more users join.');
      } else {
        toast.success(`Found ${foundMatches.length} potential matches!`);
      }
    } catch (error) {
      toast.error('Failed to find matches');
      console.error('Failed to find matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!user || currentIndex >= matches.length) return;
    
    const match = matches[currentIndex];
    setProcessing(true);
    
    try {
      const result = await MatchService.respondToMatch(match.id, user.id, true);
      
      if (result.bothAccepted && result.roomId) {
        toast.success('It\'s a match! 🎉', {
          description: `You and ${match.user.displayName} both accepted!`,
        });
        
        // Navigate to chat after a short delay
        setTimeout(() => {
          navigate(`/chat/${result.roomId}`, {
            state: {
              otherUser: match.user,
              match,
            },
          });
        }, 1500);
      } else {
        toast.success('Request sent!');
        moveToNext();
      }
    } catch (error) {
      toast.error('Failed to respond to match');
      console.error('Failed to respond to match:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!user || currentIndex >= matches.length) return;
    
    const match = matches[currentIndex];
    setProcessing(true);
    
    try {
      await MatchService.respondToMatch(match.id, user.id, false);
      toast('Passed');
      moveToNext();
    } catch (error) {
      toast.error('Failed to respond to match');
      console.error('Failed to respond to match:', error);
    } finally {
      setProcessing(false);
    }
  };

  const moveToNext = () => {
    if (currentIndex < matches.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      toast.info('No more matches. Back to discovery!');
      setTimeout(() => navigate('/discover'), 1500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="relative z-10 text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-lg text-muted-foreground">Finding your matches...</p>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="relative z-10 text-center space-y-4">
          <p className="text-lg text-muted-foreground">No matches found</p>
          <Button onClick={() => navigate('/discover')}>Back to Discovery</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden pt-20">
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-display font-semibold flex items-center justify-center gap-3">
              <PartyPopper className="w-8 h-8 text-primary" />
              You have matches!
            </h1>
            <p className="text-muted-foreground">
              {currentIndex + 1} of {matches.length}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.28 }}
            >
              <MatchCard
                match={matches[currentIndex]}
                onAccept={handleAccept}
                onReject={handleReject}
                disabled={processing}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
