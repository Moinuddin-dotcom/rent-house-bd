'use client';

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/use-favorites';
import { cn } from '@/lib/utils';

export function FavoriteButton({ listingId, className }: { listingId: string; className?: string }) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(listingId);

  return (
    <Button
      type="button"
      size="icon"
      variant="secondary"
      aria-pressed={active}
      aria-label={active ? 'Remove from favourites' : 'Save to favourites'}
      className={cn('rounded-full bg-background/90 shadow', className)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggle(listingId);
      }}
    >
      <Heart className={cn(active && 'fill-red-500 text-red-500')} />
    </Button>
  );
}
