import { Match } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, X, Film } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface MatchCardProps {
  match: Match;
  onAccept: () => void;
  onReject: () => void;
  disabled?: boolean;
}

export function MatchCard({ match, onAccept, onReject, disabled }: MatchCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.28 }}
    >
      <Card className="overflow-hidden backdrop-blur-glass border-border/50 max-w-lg mx-auto">
        <CardContent className="p-6 space-y-6">
          {/* User info */}
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 ring-2 ring-primary/20">
              <AvatarImage src={match.user.avatar} alt={match.user.displayName} />
              <AvatarFallback>
                {match.user.displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{match.user.displayName}</h3>
              <p className="text-sm text-muted-foreground">
                {match.sharedMovies.length} shared {match.sharedMovies.length === 1 ? 'movie' : 'movies'}
              </p>
            </div>
          </div>

          {/* Shared movies */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Film className="w-4 h-4" />
              <span>You both picked</span>
            </div>
            <div className="space-y-2">
              {match.sharedMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50"
                >
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-12 h-18 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium line-clamp-1">{movie.title}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{movie.year}</span>
                      <span>•</span>
                      <span>{movie.runtime} min</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {movie.genres.slice(0, 2).map((genre) => (
                        <Badge key={genre} variant="secondary" className="text-xs">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <p className="text-center text-sm text-muted-foreground">
              Make it a CineMatch?
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-colors"
                onClick={onReject}
                disabled={disabled}
              >
                <X className="w-5 h-5 mr-2" />
                Not now
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={onAccept}
                disabled={disabled}
              >
                <Heart className="w-5 h-5 mr-2" />
                Yes!
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
