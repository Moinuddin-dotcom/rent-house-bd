'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { DEFAULT_MAP_CENTER } from '@/lib/constants';

const pin = L.divIcon({
  className: '',
  html: '<div style="width:18px;height:18px;border-radius:9999px;background:hsl(var(--primary));border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,.4);transform:translate(-50%,-50%)"></div>',
});

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6))) });
  return null;
}

/** Click on the map to pin the property's location (used for map-based search). */
export default function LocationPicker({
  latitude,
  longitude,
  onPick,
}: {
  latitude?: number;
  longitude?: number;
  onPick: (lat: number, lng: number) => void;
}) {
  const hasPoint = latitude != null && longitude != null && !Number.isNaN(latitude) && !Number.isNaN(longitude);
  return (
    <MapContainer
      center={hasPoint ? [latitude!, longitude!] : DEFAULT_MAP_CENTER}
      zoom={hasPoint ? 15 : 12}
      className="h-72 w-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={onPick} />
      {hasPoint && <Marker position={[latitude!, longitude!]} icon={pin} />}
    </MapContainer>
  );
}
