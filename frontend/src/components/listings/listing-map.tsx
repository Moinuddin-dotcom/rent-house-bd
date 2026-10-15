'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';
import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { DEFAULT_MAP_CENTER } from '@/lib/constants';
import { formatBDT } from '@/lib/utils';
import type { ListingSummary } from '@/types';

// Price-tag style marker (avoids bundling Leaflet's default PNG icons)
function priceIcon(amount: number) {
  return L.divIcon({
    className: '',
    html: `<div style="background:hsl(var(--primary));color:white;padding:2px 8px;border-radius:9999px;font-size:12px;font-weight:600;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.3);transform:translate(-50%,-100%);display:inline-block">${formatBDT(amount)}</div>`,
  });
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

function BoundsWatcher({ onChange }: { onChange?: (b: MapBounds) => void }) {
  const map = useMapEvents({
    moveend: () => {
      const b = map.getBounds();
      onChange?.({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() });
    },
  });
  return null;
}

function FitToListings({ listings }: { listings: ListingSummary[] }) {
  const map = useMap();
  useEffect(() => {
    const points = listings
      .filter((l) => l.latitude != null && l.longitude != null)
      .map((l) => [l.latitude!, l.longitude!] as [number, number]);
    if (points.length > 0) map.fitBounds(points, { padding: [40, 40], maxZoom: 15 });
    // only on first render — afterwards the user controls the viewport
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

/** Map-based search: listings pinned by rent. Must be loaded with next/dynamic (ssr: false). */
export default function ListingMap({
  listings,
  onBoundsChange,
  className = 'h-[600px]',
}: {
  listings: ListingSummary[];
  onBoundsChange?: (b: MapBounds) => void;
  className?: string;
}) {
  const pinned = listings.filter((l) => l.latitude != null && l.longitude != null);

  return (
    <MapContainer center={DEFAULT_MAP_CENTER} zoom={12} scrollWheelZoom className={`w-full rounded-xl ${className}`}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToListings listings={pinned} />
      <BoundsWatcher onChange={onBoundsChange} />
      {pinned.map((l) => (
        <Marker key={l.id} position={[l.latitude!, l.longitude!]} icon={priceIcon(l.rentAmount)}>
          <Popup>
            <Link href={`/listings/${l.id}`} className="font-semibold">
              {l.title}
            </Link>
            <br />
            {l.bedrooms} bed · {l.area}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
