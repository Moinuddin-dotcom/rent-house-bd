import { Bath, BedDouble, Building, CalendarDays, MapPin, Ruler, Sofa } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContactPanel } from '@/components/listings/contact-panel';
import { FavoriteButton } from '@/components/listings/favorite-button';
import { ListingGallery } from '@/components/listings/listing-gallery';
import { ListingMapLazy } from '@/components/listings/listing-map-lazy';
import { StatusBadge } from '@/components/listings/status-badge';
import { YoutubeEmbed } from '@/components/listings/youtube-embed';
import { Badge } from '@/components/ui/badge';
import { serverApi } from '@/lib/api-client';
import { formatBDT, formatDate, titleCase } from '@/lib/utils';
import type { Listing } from '@/types';

type Props = { params: Promise<{ id: string }> };

async function getListing(id: string) {
  return serverApi<Listing>(`/listings/${id}`, undefined, 30);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await getListing((await params).id);
  if (!listing) return { title: 'Listing not found' };
  return {
    title: `${listing.title} — ${formatBDT(listing.rentAmount)}/month`,
    description: `${titleCase(listing.propertyType)} for rent in ${listing.area}, ${listing.district}. ${listing.bedrooms} bed, ${listing.bathrooms} bath.`,
    openGraph: { images: listing.images[0] ? [listing.images[0].url] : [] },
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const listing = await getListing((await params).id);
  if (!listing) notFound();

  const facts = [
    { icon: BedDouble, label: `${listing.bedrooms} bedrooms` },
    { icon: Bath, label: `${listing.bathrooms} bathrooms` },
    listing.areaSqft ? { icon: Ruler, label: `${listing.areaSqft} sqft` } : null,
    listing.floor != null ? { icon: Building, label: `Floor ${listing.floor}` } : null,
    { icon: Sofa, label: listing.furnished ? 'Furnished' : 'Unfurnished' },
    listing.availableFrom ? { icon: CalendarDays, label: `From ${formatDate(listing.availableFrom)}` } : null,
  ].filter(Boolean) as { icon: typeof Bath; label: string }[];

  const readyVideos = listing.videos.filter((v) => v.status === 'READY' && v.youtubeId);

  return (
    <div className="container grid gap-8 py-8 lg:grid-cols-[1fr_360px]">
      <div className="min-w-0 space-y-8">
        <ListingGallery images={listing.images} title={listing.title} />

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{titleCase(listing.propertyType)}</Badge>
            {listing.status !== 'ACTIVE' && <StatusBadge status={listing.status} />}
          </div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold md:text-3xl">{listing.title}</h1>
            <FavoriteButton listingId={listing.id} />
          </div>
          <p className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4" /> {listing.address}, {listing.area}, {listing.district}, {listing.division}
          </p>
          <p className="text-3xl font-bold text-primary">
            {formatBDT(listing.rentAmount)}
            <span className="text-base font-normal text-muted-foreground"> /month</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {facts.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 rounded-lg border p-3 text-sm">
              <Icon className="h-4 w-4 text-primary" /> {label}
            </div>
          ))}
        </div>

        <section>
          <h2 className="mb-2 text-lg font-semibold">About this property</h2>
          <p className="whitespace-pre-line text-muted-foreground">{listing.description}</p>
        </section>

        {readyVideos.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Video tour</h2>
            {readyVideos.map((v) => (
              <YoutubeEmbed key={v.id} videoId={v.youtubeId!} title={listing.title} />
            ))}
          </section>
        )}

        {listing.latitude != null && listing.longitude != null && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Location</h2>
            <ListingMapLazy listings={[listing]} className="h-80" />
          </section>
        )}

        <p className="text-xs text-muted-foreground">
          Listed by {listing.owner.name} on {formatDate(listing.createdAt)}
        </p>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        {listing.status === 'ACTIVE' ? (
          <ContactPanel listingId={listing.id} title={listing.title} />
        ) : (
          <p className="rounded-xl border p-6 text-sm text-muted-foreground">This property is no longer available.</p>
        )}
      </aside>
    </div>
  );
}
