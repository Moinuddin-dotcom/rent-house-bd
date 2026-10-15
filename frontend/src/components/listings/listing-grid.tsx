import { SearchX } from 'lucide-react';
import type { ListingSummary } from '@/types';
import { ListingCard } from './listing-card';

export function ListingGrid({ listings, emptyMessage = 'No listings match your search.' }: {
  listings: ListingSummary[];
  emptyMessage?: string;
}) {
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center text-muted-foreground">
        <SearchX className="mb-3 h-10 w-10" />
        <p>{emptyMessage}</p>
      </div>
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
