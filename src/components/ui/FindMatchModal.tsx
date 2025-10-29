import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, Users } from 'lucide-react';

interface FindMatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: () => void;
  onFindMatch: () => void;
  moviesLikedCount: number;
}

export function FindMatchModal({
  open,
  onOpenChange,
  onContinue,
  onFindMatch,
  moviesLikedCount,
}: FindMatchModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Heart className="w-6 h-6 fill-primary text-primary" />
            Great choices!
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            You've liked {moviesLikedCount} movie{moviesLikedCount !== 1 ? 's' : ''}. 
            Ready to find your CineMatch?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Find users who share your taste</p>
                <p className="text-xs text-muted-foreground mt-1">
                  See people who liked the same movies and start conversations
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Keep discovering</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Like more movies to find even better matches
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => {
              onContinue();
              onOpenChange(false);
            }}
            className="gap-2"
          >
            <Heart className="w-4 h-4" />
            Continue Discovering
          </Button>
          <Button
            onClick={() => {
              onFindMatch();
              onOpenChange(false);
            }}
            className="gap-2"
          >
            <Users className="w-4 h-4" />
            Find your CineMatch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
