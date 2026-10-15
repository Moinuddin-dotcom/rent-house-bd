'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

/** Leaflet touches `window`, so the map is only rendered client-side. */
export const ListingMapLazy = dynamic(() => import('./listing-map'), {
  ssr: false,
  loading: () => <Skeleton className="h-[600px] w-full rounded-xl" />,
});
