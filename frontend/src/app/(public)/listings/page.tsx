import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { ListingGridSkeleton } from '@/components/listings/listing-card-skeleton';
import { ListingsExplorer } from '@/components/listings/listings-explorer';

export const metadata: Metadata = {
  title: 'Houses & flats for rent',
  description: 'Search houses and flats for rent across Bangladesh by area, price and bedrooms.',
};

export default function ListingsPage() {
  return (
    <div className="container py-8">
      <PageHeader title="Houses & flats for rent" description="Free to browse — no account needed." />
      <Suspense fallback={<ListingGridSkeleton />}>
        <ListingsExplorer />
      </Suspense>
    </div>
  );
}
