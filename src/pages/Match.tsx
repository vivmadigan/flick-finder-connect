import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useVisualFX } from '@/context/VisualFXProvider';
import { MatchService } from '@/lib/services/MatchService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, PartyPopper, Film, Heart, X, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { MatchCandidate } from '@/types';
import { debugFlow } from '@/lib/debug';
import { MatchStateMachine, MatchCardState } from '@/lib/state/MatchStateMachine';

export default function Match() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setPreset } = useVisualFX();
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setPreset('standard');
    debugFlow.userAction('Match', 'Component mounted');
  }, [setPreset]);

  useEffect(() => {
    if (!user) return;
    
    console.log('[Match] Component mounted, fetching candidates');
    loadCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadCandidates = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      debugFlow.apiCall('GET', '/api/Matches/candidates');
      
      const candidatesData = await MatchService.getCandidates();
      
      debugFlow.apiResponse('/api/Matches/candidates', 200, {
        count: candidatesData.length,
      });
      
      setCandidates(candidatesData);
      
      if (candidatesData.length > 0) {
        toast.success(`Found ${candidatesData.length} potential match${candidatesData.length === 1 ? '' : 'es'}!`);
      }
    } catch (error) {
      toast.error('Failed to load candidates');
      console.error('[Match] Failed to load candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async (candidate: MatchCandidate) => {
    if (!user) return;
    
    // Use the first shared movie for the match request
    const tmdbId = candidate.sharedMovieIds[0];
    
    setProcessingIds(prev => new Set(prev).add(candidate.userId));
    
    try {
      debugFlow.userAction('Match', 'Accepting match', {
        targetUserId: candidate.userId,
        targetDisplayName: candidate.displayName,
        tmdbId,
      });
      
      const result = await MatchService.acceptMatch(candidate.userId, tmdbId);
      
      if (result.matched && result.roomId) {
        // Mutual match - both users accepted!
        debugFlow.stateChange(
          'MatchCard',
          candidate.matchStatus,
          'matched',
          'Mutual match confirmed'
        );
        
        toast.success('It\'s a match! 🎉', {
          description: `You and ${candidate.displayName} matched!`,
          action: {
            label: 'Open Chat',
            onClick: () => {
              debugFlow.navigate('/matches', `/chat/${result.roomId}`, 'Open match chat');
              navigate(`/chat/${result.roomId}`);
            },
          },
        });
        
        // Remove this candidate from the list
        setCandidates(prev => prev.filter(c => c.userId !== candidate.userId));
      } else {
        // Request sent, waiting for their response
        debugFlow.stateChange(
          'MatchCard',
          candidate.matchStatus,
          'pending_sent',
          'Match request sent'
        );
        
        toast.success('Match request sent!', {
          description: `Waiting for ${candidate.displayName} to respond`,
        });
        
        // Update the candidate's status to pending_sent
        setCandidates(prev => prev.map(c => 
          c.userId === candidate.userId 
            ? { ...c, matchStatus: 'pending_sent' }
            : c
        ));
      }
    } catch (error) {
      toast.error('Failed to send match request');
      console.error('[Match] Failed to accept match:', error);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(candidate.userId);
        return newSet;
      });
    }
  };

  const handleDecline = async (candidate: MatchCandidate) => {
    if (!user) return;
    
    const tmdbId = candidate.sharedMovieIds[0];
    
    setProcessingIds(prev => new Set(prev).add(candidate.userId));
    
    try {
      debugFlow.userAction('Match', 'Declining match', {
        targetUserId: candidate.userId,
        targetDisplayName: candidate.displayName,
        tmdbId,
      });
      
      await MatchService.declineMatch(candidate.userId, tmdbId);
      
      debugFlow.stateChange(
        'MatchCard',
        candidate.matchStatus,
        'declined',
        'User declined match'
      );
      
      toast('Passed', {
        description: `You declined ${candidate.displayName}`,
      });
      
      // Remove this candidate from the list
      setCandidates(prev => prev.filter(c => c.userId !== candidate.userId));
    } catch (error) {
      toast.error('Failed to decline match');
      console.error('[Match] Failed to decline match:', error);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(candidate.userId);
        return newSet;
      });
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

  if (candidates.length === 0) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4">
        <Card className="max-w-lg w-full border-border/50 backdrop-blur-glass">
          <CardContent className="p-8 text-center space-y-6">
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-semibold">No Matches Yet</h2>
              <p className="text-muted-foreground">
                Come back later! When someone likes the same movies as you, they'll appear here.
              </p>
              <p className="text-sm text-muted-foreground">
                Keep discovering movies to increase your chances of matching with someone!
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate('/discover')} size="lg" className="w-full">
                <Film className="w-4 h-4 mr-2" />
                Continue Discovering
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
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-display font-semibold flex items-center justify-center gap-3">
              <PartyPopper className="w-8 h-8 text-primary" />
              Find Your CineMatch
            </h1>
            <p className="text-muted-foreground">
              {candidates.length} {candidates.length === 1 ? 'person' : 'people'} liked the same movies as you
            </p>
          </div>

          {/* Candidates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((candidate, index) => (
              <motion.div
                key={candidate.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden backdrop-blur-glass border-border/50 hover:border-primary/30 transition-all duration-300">
                  <CardContent className="p-6 space-y-4">
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                      <Avatar className="w-14 h-14 ring-2 ring-primary/20">
                        <AvatarImage 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.userId}`}
                          alt={candidate.displayName} 
                        />
                        <AvatarFallback>
                          {candidate.displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold font-display truncate">
                          {candidate.displayName}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Film className="w-3.5 h-3.5" />
                          {candidate.overlapCount} shared {candidate.overlapCount === 1 ? 'movie' : 'movies'}
                        </p>
                      </div>
                    </div>

                    {/* Shared Movies */}
                    {candidate.sharedMovies && candidate.sharedMovies.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                          <Film className="w-3 h-3" />
                          You both picked:
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {candidate.sharedMovies.slice(0, 3).map((movie) => (
                            <div
                              key={movie.tmdbId}
                              className="group relative overflow-hidden rounded-lg aspect-[2/3]"
                            >
                              <img
                                src={movie.posterUrl}
                                alt={movie.title}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                <p className="text-white text-xs font-medium line-clamp-2 leading-tight">
                                  {movie.title}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        {candidate.sharedMovies.length > 3 && (
                          <p className="text-xs text-muted-foreground text-center">
                            +{candidate.sharedMovies.length - 3} more shared {candidate.sharedMovies.length - 3 === 1 ? 'movie' : 'movies'}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground text-center py-2">
                        {candidate.overlapCount} shared {candidate.overlapCount === 1 ? 'movie' : 'movies'}
                      </div>
                    )}

                    {/* Match Status Message */}
                    {candidate.matchStatus === 'pending_received' && (
                      <div className="flex items-center gap-2 text-xs text-primary bg-primary/10 rounded-lg p-2">
                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                        <span className="font-medium">{candidate.displayName} is waiting for your response!</span>
                      </div>
                    )}

                    {candidate.matchStatus === 'pending_sent' && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-lg p-2">
                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                        <span>
                          Waiting for {candidate.displayName} to respond
                          {candidate.requestSentAt && ` (sent ${formatDistanceToNow(new Date(candidate.requestSentAt), { addSuffix: true })})`}
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      {candidate.matchStatus !== 'pending_sent' && candidate.matchStatus !== 'matched' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-colors"
                          onClick={() => handleDecline(candidate)}
                          disabled={processingIds.has(candidate.userId)}
                        >
                          {processingIds.has(candidate.userId) ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <X className="w-4 h-4 mr-1" />
                              Decline
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        className="flex-1"
                        variant={candidate.matchStatus === 'pending_sent' ? "outline" : "default"}
                        onClick={() => handleMatch(candidate)}
                        disabled={
                          processingIds.has(candidate.userId) || 
                          candidate.matchStatus === 'pending_sent' || 
                          candidate.matchStatus === 'matched'
                        }
                      >
                        {processingIds.has(candidate.userId) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : candidate.matchStatus === 'matched' ? (
                          <>
                            <Heart className="w-4 h-4 mr-1 fill-current" />
                            Matched!
                          </>
                        ) : candidate.matchStatus === 'pending_sent' ? (
                          <>
                            <Clock className="w-4 h-4 mr-1 animate-pulse" />
                            Pending
                          </>
                        ) : (
                          <>
                            <Heart className="w-4 h-4 mr-1" />
                            {candidate.matchStatus === 'pending_received' ? 'Accept Match' : 'Match'}
                          </>
                        )}
                      </Button>
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
