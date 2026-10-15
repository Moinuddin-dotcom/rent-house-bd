'use client';

import { LayoutGrid, Map as MapIcon, SlidersHorizontal } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { NativeSelect } from '@/components/ui/native-select';
import { useDebounce } from '@/hooks/use-debounce';
import { api, buildQuery } from '@/lib/api-client';
import { parseFilters, type ListingFilters as Filters } from '@/lib/validations/filters';
import type { ListingSummary, Paginated } from '@/types';
import { ListingFilters } from './listing-filters';
import { ListingGridSkeleton } from './listing-card-skeleton';
import { ListingGrid } from './listing-grid';
import type { MapBounds } from './listing-map';
import { ListingMapLazy } from './listing-map-lazy';
import { Pagination } from './pagination';

const PAGE_SIZE = 12;
const MAP_PAGE_SIZE = 50;

/**
 * Real-time search: filter changes are debounced, synced to the URL (shareable searches)
 * and re-fetched from the API. The map view re-queries by the visible bounding box.
 */
export function ListingsExplorer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<Filters>(() => parseFilters(searchParams));
  const [view, setView] = useState<'grid' | 'map'>('grid');
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [result, setResult] = useState<Paginated<ListingSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debounced = useDebounce(filters, 400);
  const debouncedBounds = useDebounce(bounds, 500);
  const requestId = useRef(0);

  // Keep the URL in sync so searches can be shared / bookmarked
  useEffect(() => {
    router.replace(`${pathname}${buildQuery(debounced)}`, { scroll: false });
  }, [debounced, pathname, router]);

  const query = useMemo(
    () =>
      view === 'map'
        ? { ...debounced, page: 1, limit: MAP_PAGE_SIZE, ...(debouncedBounds ?? {}) }
        : { ...debounced, page: debounced.page ?? 1, limit: PAGE_SIZE },
    [debounced, debouncedBounds, view],
  );

  useEffect(() => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    api<Paginated<ListingSummary>>('/listings', { query })
      .then((res) => id === requestId.current && setResult(res))
      .catch((e: Error) => id === requestId.current && setError(e.message))
      .finally(() => id === requestId.current && setLoading(false));
  }, [query]);

  const update = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch, page: patch.page ?? undefined }));

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className={showFilters ? 'block' : 'hidden lg:block'}>
        <div className="rounded-xl border p-5 lg:sticky lg:top-24">
          <ListingFilters value={filters} onChange={update} onReset={() => setFilters({})} />
        </div>
      </aside>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {result ? `${result.meta.total} ${result.meta.total === 1 ? 'home' : 'homes'} found` : 'Searching…'}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setShowFilters((s) => !s)}>
              <SlidersHorizontal /> Filters
            </Button>
            <NativeSelect
              className="h-8 w-40"
              value={filters.sort ?? 'newest'}
              onChange={(e) => update({ sort: e.target.value as Filters['sort'] })}
              aria-label="Sort"
            >
              <option value="newest">Newest first</option>
              <option value="rent_asc">Rent: low to high</option>
              <option value="rent_desc">Rent: high to low</option>
            </NativeSelect>
            <div className="flex rounded-md border">
              <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('grid')} aria-label="Grid view">
                <LayoutGrid />
              </Button>
              <Button variant={view === 'map' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('map')} aria-label="Map view">
                <MapIcon />
              </Button>
            </div>
          </div>
        </div>

        {error ? (
          <p className="rounded-lg border border-destructive/40 p-4 text-sm text-destructive">{error}</p>
        ) : view === 'map' ? (
          <div className="space-y-2">
            <ListingMapLazy listings={result?.data ?? []} onBoundsChange={setBounds} />
            <p className="text-xs text-muted-foreground">Move or zoom the map to search that area. Only listings with a pinned location appear.</p>
          </div>
        ) : loading && !result ? (
          <ListingGridSkeleton />
        ) : (
          <div className={loading ? 'pointer-events-none opacity-60 transition-opacity' : 'transition-opacity'}>
            <ListingGrid listings={result?.data ?? []} />
            {result && (
              <Pagination
                page={result.meta.page}
                totalPages={result.meta.totalPages}
                onChange={(page) => {
                  update({ page });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}
          </div>
        )}
      </section>
    </div>
  );
}
