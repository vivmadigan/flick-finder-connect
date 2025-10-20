import { Movie } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X, Clock, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';

interface SingleMovieCardProps {
  movie: Movie;
  onLike: () => void;
  onSkip: () => void;
  disabled?: boolean;
}

export function SingleMovieCard({ movie, onLike, onSkip, disabled }: SingleMovieCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.24 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="overflow-hidden backdrop-blur-glass border-border/50 hover:shadow-glow transition-all rounded-2xl">
        <div className="aspect-[2/3] relative overflow-hidden bg-muted">
          <img
            src={movie.poster}
            alt={`${movie.title} poster`}
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
        <CardContent className="p-6 space-y-4">
          <div>
            <h2 className="font-display font-semibold text-2xl mb-2">{movie.title} ({movie.year})</h2>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{movie.runtime} min</span>
              </div>
              {movie.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span>{movie.rating}</span>
                </div>
              )}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-muted-foreground line-clamp-1 cursor-help">
                    {movie.synopsis}
                  </p>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p>{movie.synopsis}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex flex-wrap gap-2">
            {movie.genres.slice(0, 4).map((genre) => (
              <Badge key={genre} variant="secondary" className="text-xs">
                {genre}
              </Badge>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-colors rounded-2xl"
              onClick={onSkip}
              disabled={disabled}
            >
              <X className="w-5 h-5 mr-2" />
              Skip
            </Button>
            <Button
              size="lg"
              className="flex-1 rounded-2xl"
              onClick={onLike}
              disabled={disabled}
            >
              <Heart className="w-5 h-5 mr-2" />
              Want to watch
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
