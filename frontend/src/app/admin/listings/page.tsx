'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { Pagination } from '@/components/listings/pagination';
import { StatusBadge } from '@/components/listings/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Skeleton } from '@/components/ui/skeleton';
import { useApi } from '@/hooks/use-api';
import { api, buildQuery } from '@/lib/api-client';
import { formatBDT } from '@/lib/utils';
import type { AdminListing, ListingStatus, Paginated } from '@/types';

function AdminListingsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const status = params.get('status') ?? '';
  const q = params.get('q') ?? '';
  const page = Number(params.get('page') ?? 1);
  const [search, setSearch] = useState(q);
  const { data, loading, reload } = useApi<Paginated<AdminListing>>(`/admin/listings${buildQuery({ status, q, page })}`);

  const navigate = (next: { status?: string; q?: string; page?: number }) =>
    router.push(`/admin/listings${buildQuery({ status, q, page: 1, ...next })}`);

  const setListingStatus = async (id: string, next: ListingStatus) => {
    try {
      await api(`/admin/listings/${id}/status`, { method: 'PATCH', body: { status: next } });
      toast.success('Listing updated');
      void reload();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <>
      <PageHeader title="Listings" description="Moderate listings posted by owners." />
      <form
        className="mb-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ q: search });
        }}
      >
        <Input placeholder="Search title, area or owner email" value={search} onChange={(e) => setSearch(e.target.value)} />
        <NativeSelect className="sm:w-40" value={status} onChange={(e) => navigate({ status: e.target.value })}>
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="RENTED">Rented</option>
          <option value="REMOVED">Removed</option>
        </NativeSelect>
        <Button type="submit">Search</Button>
      </form>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : !data?.data.length ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">No listings found.</p>
      ) : (
        <div className="space-y-3">
          {data.data.map((l) => (
            <Card key={l.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <Link href={`/listings/${l.id}`} className="font-semibold hover:underline">
                    {l.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {formatBDT(l.rentAmount)} · {l.area}, {l.district} · {l.owner.name} ({l.owner.email})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={l.status} />
                  {l.status === 'REMOVED' ? (
                    <Button size="sm" variant="outline" onClick={() => setListingStatus(l.id, 'ACTIVE')}>
                      Restore
                    </Button>
                  ) : (
                    <Button size="sm" variant="destructive" onClick={() => setListingStatus(l.id, 'REMOVED')}>
                      Remove
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={(p) => navigate({ page: p })} />
        </div>
      )}
    </>
  );
}

export default function AdminListingsPage() {
  return (
    <Suspense>
      <AdminListingsContent />
    </Suspense>
  );
}
