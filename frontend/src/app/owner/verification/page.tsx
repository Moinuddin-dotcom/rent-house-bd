'use client';

import Link from 'next/link';
import { VerificationForm } from '@/components/forms/verification-form';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useApi } from '@/hooks/use-api';
import type { OwnerProfile } from '@/types';
import { VerificationBanner } from '../verification-banner';
import { useAuth } from '@/hooks/use-auth';

export default function OwnerVerificationPage() {
  const { user } = useAuth();
  const { data: profile, loading } = useApi<OwnerProfile | null>('/owners/verification/me');
  const canSubmit = !profile || profile.status === 'REJECTED';

  return (
    <div className="-mx-2 max-w-3xl sm:mx-auto">
      <PageHeader
        title="Owner verification"
        description="Confirm your identity and prove that you own the building, flat or land."
      />
      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : canSubmit ? (
        <Card>
          <CardContent className="px-2 py-6 sm:p-6">
            <VerificationForm
              defaults={
                profile
                  ? {
                      fullName: profile.fullName,
                      nationalIdNumber: profile.nationalIdNumber,
                      phone: profile.phone,
                      addressDivision: profile.addressDivision ?? '',
                      addressDistrict: profile.addressDistrict ?? '',
                      addressArea: profile.addressArea ?? '',
                      addressZone: profile.addressZone ?? undefined,
                      addressZoneName: profile.addressZoneName ?? '',
                      address: profile.address,
                      propertyDivision: profile.propertyDivision ?? '',
                      propertyDistrict: profile.propertyDistrict ?? '',
                      propertyArea: profile.propertyArea ?? '',
                      propertyZone: profile.propertyZone ?? undefined,
                      propertyZoneName: profile.propertyZoneName ?? '',
                      propertyAddress: profile.propertyAddress,
                      ownershipType: profile.ownershipType,
                      notes: profile.notes ?? '',
                    }
                  : undefined
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {user && <VerificationBanner user={user} />}
          <Button variant="outline" asChild>
            <Link href="/owner/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
