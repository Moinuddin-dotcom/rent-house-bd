'use client';

import { RequireAuth } from '@/components/layout/require-auth';
import { PageHeader } from '@/components/layout/page-header';
import { ListingGridSkeleton } from '@/components/listings/listing-card-skeleton';
import { ListingGrid } from '@/components/listings/listing-grid';
import { useApi } from '@/hooks/use-api';
import { useFavorites } from '@/hooks/use-favorites';
import type { ListingSummary } from '@/types';

function FavoritesContent() {
  const { data, loading, error } = useApi<ListingSummary[]>('/favorites');
  const { ids } = useFavorites();
  // Hide listings un-hearted on this page without refetching
  const visible = (data ?? []).filter((l) => ids.has(l.id));

  return (
    <div className="container py-8">
      <PageHeader title="Your favourites" description="Homes you've saved for later." />
      {loading ? (
        <ListingGridSkeleton count={3} />
      ) : error ? (
        <p className="text-destructive">{error}</p>
      ) : (
        <ListingGrid listings={visible} emptyMessage="You haven't saved any homes yet. Tap the ♥ on a listing to save it." />
      )}
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <RequireAuth>
      <FavoritesContent />
    </RequireAuth>
  );
}
