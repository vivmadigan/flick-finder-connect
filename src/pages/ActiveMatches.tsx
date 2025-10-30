import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useVisualFX } from '@/context/VisualFXProvider';
import { MatchService } from '@/lib/services/MatchService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquare, Film, Heart, Users } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface SharedMovie {
  tmdbId: number;
  title: string;
  posterUrl: string;
  releaseYear?: string | null;
}

interface ActiveMatch {
  userId: string;
  displayName: string;
  roomId: string;
  matchedAt: string;
  lastMessageAt?: string | null;
  lastMessage?: string | null;
  unreadCount: number;
  sharedMovies: SharedMovie[];
}

export default function ActiveMatches() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setPreset } = useVisualFX();
  const [matches, setMatches] = useState<ActiveMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPreset('standard');
  }, [setPreset]);

  useEffect(() => {
    if (!user) return;
    
    console.log('[ActiveMatches] Component mounted, fetching active matches');
    loadActiveMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadActiveMatches = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('[ActiveMatches] Fetching active matches');
      
      const matchesData = await MatchService.getActiveMatches();
      
      console.log('[ActiveMatches] Received matches:', matchesData);
      setMatches(matchesData);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load active matches';
      console.error('[ActiveMatches] Failed to load matches:', error);
      console.error('[ActiveMatches] Error details:', errorMessage);
      
      toast.error('Backend Error', {
        description: 'The Active Matches endpoint has a bug. Please check backend logs.',
      });
      
      // Set empty array so UI shows "No matches" instead of loading forever
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="relative z-10 text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-lg text-muted-foreground">Loading your matches...</p>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4">
        <Card className="max-w-lg w-full border-border/50 backdrop-blur-glass">
          <CardContent className="p-8 text-center space-y-6">
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-semibold">No Active Matches</h2>
              <p className="text-muted-foreground">
                You haven't matched with anyone yet. Start discovering movies to find your CineMatch!
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate('/discover')} size="lg" className="w-full">
                <Film className="w-4 h-4 mr-2" />
                Discover Movies
              </Button>
              <Button onClick={() => navigate('/matches')} variant="outline" size="lg" className="w-full">
                <Users className="w-4 h-4 mr-2" />
                Browse Candidates
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden pt-20 pb-12">
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-display font-semibold flex items-center justify-center gap-3">
              <Heart className="w-8 h-8 text-primary fill-current" />
              Active Matches
            </h1>
            <p className="text-muted-foreground">
              {matches.length} {matches.length === 1 ? 'match' : 'matches'} • Start chatting about your favorite movies!
            </p>
          </div>

          {/* Matches List */}
          <div className="space-y-4">
            {matches.map((match, index) => (
              <motion.div
                key={match.roomId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card 
                  className="overflow-hidden backdrop-blur-glass border-border/50 hover:border-primary/30 transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/chat/${match.roomId}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Movie Poster or Avatar */}
                      {match.sharedMovies.length > 0 ? (
                        <div className="w-24 h-36 flex-shrink-0 rounded-lg overflow-hidden">
                          <img 
                            src={match.sharedMovies[0].posterUrl} 
                            alt={match.sharedMovies[0].title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-36 flex-shrink-0 rounded-lg bg-muted flex items-center justify-center">
                          <Film className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}

                      {/* Match Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold font-display truncate">
                              {match.displayName}
                            </h3>
                            {match.unreadCount > 0 && (
                              <Badge variant="default" className="ml-auto">
                                {match.unreadCount} new
                              </Badge>
                            )}
                          </div>

                          {/* Last Message */}
                          {match.lastMessage ? (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {match.lastMessage}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground italic mb-2">
                              Start a conversation about {match.sharedMovies[0]?.title || 'your shared movies'}
                            </p>
                          )}

                          {/* Shared Movies */}
                          {match.sharedMovies.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Film className="w-3 h-3" />
                              <span>
                                {match.sharedMovies.length} shared {match.sharedMovies.length === 1 ? 'movie' : 'movies'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-muted-foreground">
                            {match.lastMessageAt 
                              ? formatDistanceToNow(new Date(match.lastMessageAt), { addSuffix: true })
                              : `Matched ${formatDistanceToNow(new Date(match.matchedAt), { addSuffix: true })}`
                            }
                          </span>
                          <Button size="sm" variant="ghost" className="gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Open Chat
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
