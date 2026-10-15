import Link from 'next/link';
import { Bath, BedDouble, MapPin, Ruler } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatBDT, titleCase } from '@/lib/utils';
import type { ListingSummary } from '@/types';
import { FavoriteButton } from './favorite-button';
import { LazyImage } from './lazy-image';

export function ListingCard({ listing }: { listing: ListingSummary }) {
  return (
    <Link href={`/listings/${listing.id}`} className="group block focus:outline-none">
      <Card className="overflow-hidden transition-shadow group-hover:shadow-lg group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <div className="relative">
          <LazyImage src={listing.images[0]?.url} alt={listing.title} className="aspect-[4/3] w-full" />
          <Badge className="absolute left-3 top-3" variant="secondary">
            {titleCase(listing.propertyType)}
          </Badge>
          <FavoriteButton listingId={listing.id} className="absolute right-3 top-3" />
        </div>
        <CardContent className="space-y-2 p-4">
          <p className="text-lg font-bold text-primary">
            {formatBDT(listing.rentAmount)}
            <span className="text-sm font-normal text-muted-foreground"> /month</span>
          </p>
          <h3 className="line-clamp-1 font-semibold">{listing.title}</h3>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">
              {listing.area}, {listing.district}
            </span>
          </p>
          <div className="flex gap-4 pt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <BedDouble className="h-4 w-4" /> {listing.bedrooms} bed
            </span>
            <span className="flex items-center gap-1">
              <Bath className="h-4 w-4" /> {listing.bathrooms} bath
            </span>
            {listing.areaSqft ? (
              <span className="flex items-center gap-1">
                <Ruler className="h-4 w-4" /> {listing.areaSqft} sqft
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
