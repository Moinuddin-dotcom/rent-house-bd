'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ListingForm } from '@/components/forms/listing-form';
import { PageHeader } from '@/components/layout/page-header';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api-client';
import { toListingPayload, type ListingFormValues } from '@/lib/validations/listing';
import { VerificationBanner } from '../../verification-banner';

export default function NewListingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (values: ListingFormValues) => {
    try {
      const listing = await api<{ id: string }>('/listings', { method: 'POST', body: toListingPayload(values) });
      toast.success('Listing created! Now add photos and videos.');
      router.push(`/owner/listings/${listing.id}/edit`);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  if (user && user.ownerVerificationStatus !== 'APPROVED') {
    return <VerificationBanner user={user} />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Post a rental" description="Step 1 of 2 — details. You'll add photos and videos next." />
      <ListingForm
        defaultValues={{
          title: '',
          description: '',
          propertyType: 'FLAT',
          rentAmount: '' as unknown as number,
          bedrooms: 2,
          bathrooms: 1,
          furnished: false,
          availableFrom: '',
          division: 'Dhaka',
          district: '',
          area: '',
          address: '',
          phoneNumbers: [{ value: user?.phone ?? '' }],
          whatsappNumber: user?.phone ?? '',
          contactEmail: user?.email ?? '',
        }}
        submitLabel="Continue to photos & videos"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
