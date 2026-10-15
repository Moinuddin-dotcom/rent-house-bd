'use client';

import { ImageOff } from 'lucide-react';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/** Native lazy-loaded image with a skeleton placeholder and graceful error state. */
export function LazyImage({
  src,
  alt,
  className,
  priority = false,
}: {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={cn('flex items-center justify-center bg-muted text-muted-foreground', className)}>
        <ImageOff className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden bg-muted', className)}>
      {!loaded && <Skeleton className="absolute inset-0 rounded-none" />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={cn('h-full w-full object-cover transition-opacity duration-300', loaded ? 'opacity-100' : 'opacity-0')}
      />
    </div>
  );
}
