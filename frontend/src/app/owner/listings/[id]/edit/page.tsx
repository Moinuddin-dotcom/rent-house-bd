'use client';

import { Eye } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { ListingForm } from '@/components/forms/listing-form';
import { ListingMediaManager } from '@/components/forms/listing-media-manager';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api-client';
import { toListingPayload, type ListingFormInput, type ListingFormValues } from '@/lib/validations/listing';
import type { OwnedListing } from '@/types';

function toFormValues(l: OwnedListing): ListingFormInput {
  return {
    title: l.title,
    description: l.description,
    propertyType: l.propertyType,
    rentAmount: l.rentAmount,
    bedrooms: l.bedrooms,
    bathrooms: l.bathrooms,
    areaSqft: l.areaSqft ?? undefined,
    floor: l.floor ?? undefined,
    furnished: l.furnished,
    availableFrom: l.availableFrom ? l.availableFrom.slice(0, 10) : '',
    division: l.division,
    district: l.district,
    area: l.area,
    address: l.address,
    latitude: l.latitude ?? undefined,
    longitude: l.longitude ?? undefined,
    phoneNumbers: l.phoneNumbers.map((value) => ({ value })),
    whatsappNumber: l.whatsappNumber,
    contactEmail: l.contactEmail,
  };
}

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const { data: listing, loading, error, reload } = useApi<OwnedListing>(`/listings/${id}/manage`);

  const handleSubmit = async (values: ListingFormValues) => {
    try {
      await api(`/listings/${id}`, { method: 'PATCH', body: toListingPayload(values) });
      toast.success('Listing updated');
      void reload();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  if (loading && !listing) return <Skeleton className="h-[600px] w-full" />;
  if (error || !listing) return <p className="text-destructive">{error ?? 'Listing not found'}</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Edit listing"
        description={listing.title}
        actions={
          <Button variant="outline" asChild>
            <Link href={`/listings/${id}`}>
              <Eye /> View
            </Link>
          </Button>
        }
      />
      <ListingMediaManager listingId={id} images={listing.images} videos={listing.videos} onChange={reload} />
      <ListingForm key={listing.updatedAt} defaultValues={toFormValues(listing)} submitLabel="Save changes" onSubmit={handleSubmit} />
    </div>
  );
}
