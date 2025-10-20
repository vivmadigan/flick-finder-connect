import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DecisionPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decisionCount: number;
  likedCount: number;
  onSeeMore: () => void;
  onFindMatches: () => void;
}

export function DecisionPromptModal({
  open,
  onOpenChange,
  decisionCount,
  likedCount,
  onSeeMore,
  onFindMatches,
}: DecisionPromptModalProps) {
  const canFindMatches = likedCount >= 1;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display">You've reviewed {decisionCount} movies</AlertDialogTitle>
          <AlertDialogDescription>
            {likedCount > 0 
              ? `You've liked ${likedCount} movie${likedCount === 1 ? '' : 's'}. Ready to find your match?`
              : "You haven't liked any movies yet. Keep browsing or start matching when ready."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={onSeeMore} className="rounded-2xl">
              See more selections
            </Button>
          </AlertDialogCancel>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <AlertDialogAction
                    onClick={onFindMatches}
                    disabled={!canFindMatches}
                    className="rounded-2xl w-full sm:w-auto"
                  >
                    Find your CineMatch
                  </AlertDialogAction>
                </div>
              </TooltipTrigger>
              {!canFindMatches && (
                <TooltipContent>
                  <p>Like at least one movie to start matching</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
