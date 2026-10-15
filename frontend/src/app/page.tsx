import { BadgeCheck, HandCoins, MessageCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { HomeSearch } from '@/components/listings/home-search';
import { ListingGrid } from '@/components/listings/listing-grid';
import { Button } from '@/components/ui/button';
import { serverApi } from '@/lib/api-client';
import type { ListingSummary, Paginated } from '@/types';

const FEATURES = [
  { icon: HandCoins, title: '100% free', text: 'No fees for renters. Posting rentals is free for owners.' },
  { icon: ShieldCheck, title: 'Verified owners', text: 'Every owner proves identity and ownership before posting.' },
  { icon: MessageCircle, title: 'Contact directly', text: 'Call, WhatsApp or email owners — no middlemen.' },
  { icon: BadgeCheck, title: 'Photos & videos', text: 'See real photos and video walkthroughs before visiting.' },
];

export default async function HomePage() {
  const latest = await serverApi<Paginated<ListingSummary>>('/listings', { limit: 6 });

  return (
    <>
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
        <div className="container py-20 md:py-28">
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
            Find a house or flat for rent anywhere in Bangladesh
          </h1>
          <p className="mt-4 max-w-xl text-lg text-emerald-50/90">
            Browse verified listings for free. Register only when you&apos;re ready to contact an owner.
          </p>
          <div className="mt-8 max-w-4xl text-foreground">
            <HomeSearch />
          </div>
        </div>
      </section>

      <section className="container py-14">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border p-5">
              <Icon className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Latest rentals</h2>
          <Button variant="link" asChild>
            <Link href="/listings">View all →</Link>
          </Button>
        </div>
        <ListingGrid
          listings={latest?.data ?? []}
          emptyMessage={latest ? 'No listings yet — check back soon!' : 'Listings are unavailable right now.'}
        />
      </section>

      <section className="container mt-16">
        <div className="flex flex-col items-start gap-4 rounded-2xl bg-muted p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold">Own a flat, house or building?</h2>
            <p className="text-muted-foreground">Get verified once and post your rentals for free.</p>
          </div>
          <Button size="lg" asChild>
            <Link href="/register?type=OWNER">Register as owner</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
