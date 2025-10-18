import { LengthBucket } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

const LENGTH_OPTIONS: Array<{
  value: LengthBucket;
  label: string;
  description: string;
}> = [
  {
    value: 'short',
    label: 'Short',
    description: 'Under 100 minutes',
  },
  {
    value: 'medium',
    label: 'Medium',
    description: '100-140 minutes',
  },
  {
    value: 'long',
    label: 'Long',
    description: 'Over 140 minutes',
  },
];

interface LengthPickerProps {
  selected?: LengthBucket;
  onSelect: (length: LengthBucket) => void;
}

export function LengthPicker({ selected, onSelect }: LengthPickerProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold text-center">How long a movie?</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {LENGTH_OPTIONS.map((option) => (
          <Card
            key={option.value}
            className={cn(
              'cursor-pointer transition-all duration-micro hover:scale-[1.02] hover:shadow-glow',
              selected === option.value && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
            )}
            onClick={() => onSelect(option.value)}
          >
            <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
              <Clock
                className={cn(
                  'w-10 h-10 transition-colors',
                  selected === option.value ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <div>
                <h3 className="font-semibold text-lg">{option.label}</h3>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
