'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lock, Mail, MessageCircle, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api-client';
import type { ListingContact } from '@/types';

function whatsappLink(number: string, title: string) {
  const digits = number.replace(/\D/g, '');
  const intl = digits.startsWith('0') ? `88${digits}` : digits; // Bangladesh local → +880
  return `https://wa.me/${intl}?text=${encodeURIComponent(`Hi, I'm interested in your listing "${title}" on Rent House BD.`)}`;
}

/** Contact details are only shown to registered users — browsing stays fully public. */
export function ContactPanel({ listingId, title }: { listingId: string; title: string }) {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const [contact, setContact] = useState<ListingContact | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    api<ListingContact>(`/listings/${listingId}/contact`)
      .then(setContact)
      .catch((e: Error) => setError(e.message));
  }, [user, listingId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact owner</CardTitle>
        <CardDescription>Free for renters — no fees, ever.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {authLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : !user ? (
          <div className="space-y-3 text-center">
            <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Create a free account to see the owner&apos;s phone, WhatsApp and email.</p>
            <Button asChild className="w-full">
              <Link href={`/register?next=${encodeURIComponent(pathname)}`}>Register to contact</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/login?next=${encodeURIComponent(pathname)}`}>I already have an account</Link>
            </Button>
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : !contact ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <>
            <p className="text-sm">
              Owner: <span className="font-medium">{contact.owner.name}</span>
            </p>
            {contact.phoneNumbers.map((phone) => (
              <Button key={phone} asChild variant="outline" className="w-full justify-start">
                <a href={`tel:${phone}`}>
                  <Phone /> {phone}
                </a>
              </Button>
            ))}
            <Button asChild className="w-full justify-start bg-emerald-600 hover:bg-emerald-700">
              <a href={whatsappLink(contact.whatsappNumber, title)} target="_blank" rel="noopener noreferrer">
                <MessageCircle /> WhatsApp {contact.whatsappNumber}
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <a href={`mailto:${contact.contactEmail}?subject=${encodeURIComponent(`Rent House BD: ${title}`)}`}>
                <Mail /> {contact.contactEmail}
              </a>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
