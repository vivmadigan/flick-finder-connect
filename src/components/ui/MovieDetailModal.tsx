import { Movie } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, X, Clock } from 'lucide-react';

interface MovieDetailModalProps {
  movie: Movie | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlike?: () => void;
  showUnlikeButton?: boolean;
}

export function MovieDetailModal({
  movie,
  open,
  onOpenChange,
  onUnlike,
  showUnlikeButton = false,
}: MovieDetailModalProps) {
  if (!movie) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">{movie.title}</DialogTitle>
          <DialogDescription>
            {movie.year} • {movie.runtime} min
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Movie Poster */}
          <div className="relative aspect-[2/3] w-full max-w-sm mx-auto overflow-hidden rounded-lg">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Movie Details */}
          <div className="space-y-4">
            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Runtime & Length Bucket */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{movie.runtime} minutes</span>
              </div>
              {movie.lengthBucket && (
                <Badge variant="outline">{movie.lengthBucket} length</Badge>
              )}
            </div>

            {/* Rating */}
            {movie.rating && movie.rating > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Rating</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{movie.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">/ 10</span>
                </div>
              </div>
            )}

            {/* Synopsis */}
            {movie.synopsis && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Synopsis</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {movie.synopsis}
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Close
          </Button>
          {showUnlikeButton && onUnlike && (
            <Button
              variant="destructive"
              onClick={() => {
                onUnlike();
                onOpenChange(false);
              }}
              className="gap-2"
            >
              <Heart className="w-4 h-4 fill-current" />
              Unlike
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
