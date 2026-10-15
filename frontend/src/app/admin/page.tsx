'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useApi } from '@/hooks/use-api';
import type { AdminStats } from '@/types';

export default function AdminOverviewPage() {
  const { data, loading } = useApi<AdminStats>('/admin/stats');

  const cards = [
    { label: 'Pending owner requests', value: data?.pendingOwners, href: '/admin/owner-requests?status=PENDING' },
    { label: 'Verified owners', value: data?.approvedOwners, href: '/admin/owner-requests?status=APPROVED' },
    { label: 'Active listings', value: data?.activeListings, href: '/admin/listings?status=ACTIVE' },
    { label: 'Registered renters', value: data?.renters },
  ];

  return (
    <>
      <PageHeader title="Overview" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => {
          const card = (
            <Card className={c.href ? 'transition hover:shadow-md' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-bold">{c.value ?? 0}</p>}
              </CardContent>
            </Card>
          );
          return c.href ? (
            <Link key={c.label} href={c.href}>
              {card}
            </Link>
          ) : (
            <div key={c.label}>{card}</div>
          );
        })}
      </div>
    </>
  );
}
