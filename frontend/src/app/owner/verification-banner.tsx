'use client';

import { CheckCircle2, Clock, ShieldAlert, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { User } from '@/types';

export function VerificationBanner({ user }: { user: User }) {
  switch (user.ownerVerificationStatus) {
    case 'APPROVED':
      return (
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Verified owner</AlertTitle>
          <AlertDescription>You can post flats and houses for rent.</AlertDescription>
        </Alert>
      );
    case 'PENDING':
      return (
        <Alert variant="warning">
          <Clock className="h-4 w-4" />
          <AlertTitle>Verification under review</AlertTitle>
          <AlertDescription>Our team is checking your documents. You&apos;ll be able to post once approved.</AlertDescription>
        </Alert>
      );
    case 'REJECTED':
      return (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Verification was not approved</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{user.ownerReviewNote ?? 'Please review your documents and submit again.'}</p>
            <Button size="sm" asChild>
              <Link href="/owner/verification">Resubmit documents</Link>
            </Button>
          </AlertDescription>
        </Alert>
      );
    default:
      return (
        <Alert>
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Verify your ownership</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>Submit your ID and proof of ownership. An admin reviews every owner before they can post listings.</p>
            <Button size="sm" asChild>
              <Link href="/owner/verification">Start verification</Link>
            </Button>
          </AlertDescription>
        </Alert>
      );
  }
}
