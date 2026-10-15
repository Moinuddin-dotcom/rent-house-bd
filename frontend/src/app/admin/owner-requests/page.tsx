'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Pagination } from '@/components/listings/pagination';
import { StatusBadge } from '@/components/listings/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { NativeSelect } from '@/components/ui/native-select';
import { Skeleton } from '@/components/ui/skeleton';
import { useApi } from '@/hooks/use-api';
import { buildQuery } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import type { OwnerProfile, Paginated } from '@/types';

function OwnerRequestsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const status = params.get('status') ?? 'PENDING';
  const page = Number(params.get('page') ?? 1);
  const { data, loading } = useApi<Paginated<OwnerProfile>>(`/admin/owner-requests${buildQuery({ status, page })}`);

  const navigate = (next: { status?: string; page?: number }) =>
    router.push(`/admin/owner-requests${buildQuery({ status, page: 1, ...next })}`);

  return (
    <>
      <PageHeader
        title="Owner requests"
        description="Review identity and ownership documents before owners can post."
        actions={
          <NativeSelect className="w-40" value={status} onChange={(e) => navigate({ status: e.target.value })}>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </NativeSelect>
        }
      />
      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : !data?.data.length ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">No {status.toLowerCase()} requests.</p>
      ) : (
        <div className="space-y-3">
          {data.data.map((r) => (
            <Link key={r.id} href={`/admin/owner-requests/${r.id}`} className="block">
              <Card className="transition hover:shadow-md">
                <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">{r.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {r.user?.email} · {r._count?.documents ?? 0} documents · submitted {formatDate(r.submittedAt)}
                    </p>
                    <p className="text-sm text-muted-foreground">Property: {r.propertyAddress}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </CardContent>
              </Card>
            </Link>
          ))}
          <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={(p) => navigate({ page: p })} />
        </div>
      )}
    </>
  );
}

export default function OwnerRequestsPage() {
  return (
    <Suspense>
      <OwnerRequestsContent />
    </Suspense>
  );
}
