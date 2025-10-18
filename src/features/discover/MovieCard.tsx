import { Movie } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X, Clock, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface MovieCardProps {
  movie: Movie;
  onLike: () => void;
  onSkip: () => void;
  disabled?: boolean;
}

export function MovieCard({ movie, onLike, onSkip, disabled }: MovieCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.24 }}
      whileHover={{ scale: 1.01 }}
    >
      <Card className="overflow-hidden backdrop-blur-glass border-border/50 hover:shadow-glow transition-all rounded-2xl">
        <div className="aspect-[2/3] relative overflow-hidden bg-muted">
          <img
            src={movie.poster}
            alt={`${movie.title} poster`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1 font-display">{movie.title}</h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <span>{movie.year}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{movie.runtime} min</span>
              </div>
              {movie.rating && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-primary text-primary" />
                    <span>{movie.rating}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {movie.genres.slice(0, 3).map((genre) => (
              <Badge key={genre} variant="secondary" className="text-xs">
                {genre}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
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
              Like
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
