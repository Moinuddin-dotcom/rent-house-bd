'use client';

import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { LazyImage } from '@/components/listings/lazy-image';
import { StatusBadge } from '@/components/listings/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NativeSelect } from '@/components/ui/native-select';
import { Skeleton } from '@/components/ui/skeleton';
import { useApi } from '@/hooks/use-api';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api-client';
import { formatBDT } from '@/lib/utils';
import type { ListingStatus, OwnedListing } from '@/types';
import { VerificationBanner } from '../verification-banner';

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  const { data: listings, loading, reload } = useApi<OwnedListing[]>('/listings/mine');
  const canPost = user?.ownerVerificationStatus === 'APPROVED';

  const setStatus = async (id: string, status: ListingStatus) => {
    try {
      await api(`/listings/${id}/status`, { method: 'PATCH', body: { status } });
      toast.success('Status updated');
      void reload();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this listing permanently? Photos and videos will also be removed.')) return;
    try {
      await api(`/listings/${id}`, { method: 'DELETE' });
      toast.success('Listing deleted');
      void reload();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <>
      <PageHeader
        title="Owner dashboard"
        description="Manage your rental listings."
        actions={
          canPost && (
            <Button asChild>
              <Link href="/owner/listings/new">
                <Plus /> New listing
              </Link>
            </Button>
          )
        }
      />
      {user && (
        <div className="mb-6">
          <VerificationBanner user={user} />
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : !listings?.length ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          {canPost ? 'You have no listings yet. Create your first one!' : 'Your listings will appear here once you are verified.'}
        </p>
      ) : (
        <div className="space-y-3">
          {listings.map((l) => (
            <Card key={l.id}>
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <LazyImage src={l.images[0]?.url} alt={l.title} className="h-24 w-full shrink-0 rounded-lg sm:w-36" />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={l.status} />
                    <span className="text-sm text-muted-foreground">
                      {l.images.length} photos · {l.videos.length} videos
                    </span>
                  </div>
                  <p className="truncate font-semibold">{l.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatBDT(l.rentAmount)}/month · {l.area}, {l.district}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {l.status !== 'REMOVED' && (
                    <NativeSelect
                      className="h-8 w-32"
                      value={l.status}
                      onChange={(e) => setStatus(l.id, e.target.value as ListingStatus)}
                      aria-label="Listing status"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Hidden</option>
                      <option value="RENTED">Rented</option>
                    </NativeSelect>
                  )}
                  <Button size="icon" variant="ghost" asChild aria-label="View">
                    <Link href={`/listings/${l.id}`}>
                      <Eye />
                    </Link>
                  </Button>
                  <Button size="icon" variant="ghost" asChild aria-label="Edit">
                    <Link href={`/owner/listings/${l.id}/edit`}>
                      <Pencil />
                    </Link>
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(l.id)} aria-label="Delete">
                    <Trash2 />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
