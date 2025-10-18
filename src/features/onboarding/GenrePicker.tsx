import { Genre } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const GENRES: Genre[] = [
  'Action',
  'Comedy',
  'Drama',
  'Romance',
  'Thriller',
  'Sci-Fi',
  'Fantasy',
  'Horror',
  'Western',
  '80s',
  '90s',
  'Academy Award Winners',
  'Animated',
  'Documentary',
  'Feel-good',
  'Cult Classics',
];

interface GenrePickerProps {
  selected?: Genre;
  onSelect: (genre: Genre) => void;
}

export function GenrePicker({ selected, onSelect }: GenrePickerProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold text-center">
        Which genre are you in the mood for?
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
        {GENRES.map((genre) => (
          <Button
            key={genre}
            variant={selected === genre ? 'default' : 'outline'}
            onClick={() => onSelect(genre)}
            className={cn(
              'h-auto py-4 px-4 text-sm transition-all duration-micro',
              selected === genre && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
            )}
          >
            {genre}
          </Button>
        ))}
      </div>
    </div>
  );
}
