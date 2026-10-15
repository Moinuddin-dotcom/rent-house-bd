'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ListingImage } from '@/types';
import { LazyImage } from './lazy-image';

export function ListingGallery({ images, title }: { images: ListingImage[]; title: string }) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return <LazyImage alt={title} className="aspect-video w-full rounded-xl" />;
  }

  const go = (delta: number) => setIndex((i) => (i + delta + images.length) % images.length);

  return (
    <div className="space-y-3">
      <div className="relative">
        <LazyImage
          key={images[index].id}
          src={images[index].url}
          alt={`${title} — photo ${index + 1}`}
          className="aspect-video w-full rounded-xl"
          priority={index === 0}
        />
        {images.length > 1 && (
          <>
            <Button size="icon" variant="secondary" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full" onClick={() => go(-1)} aria-label="Previous photo">
              <ChevronLeft />
            </Button>
            <Button size="icon" variant="secondary" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full" onClick={() => go(1)} aria-label="Next photo">
              <ChevronRight />
            </Button>
            <span className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
              {index + 1} / {images.length}
            </span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setIndex(i)}
              className={cn(
                'shrink-0 overflow-hidden rounded-md ring-offset-2 transition',
                i === index ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100',
              )}
              aria-label={`Show photo ${i + 1}`}
            >
              <LazyImage src={img.url} alt="" className="h-16 w-24" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
