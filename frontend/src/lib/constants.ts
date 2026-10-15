import type { DocumentType, PropertyType } from '@/types';

export const SITE_NAME = 'Rent House BD';

export const DIVISIONS = [
  'Dhaka',
  'Chattogram',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Sylhet',
  'Rangpur',
  'Mymensingh',
] as const;

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'FLAT', label: 'Flat / Apartment' },
  { value: 'HOUSE', label: 'House' },
  { value: 'ROOM', label: 'Room' },
  { value: 'SUBLET', label: 'Sublet' },
];

export const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'NATIONAL_ID', label: 'National ID (NID)' },
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'OWNERSHIP_DEED', label: 'Ownership deed / Dolil' },
  { value: 'LAND_TAX_RECEIPT', label: 'Land tax receipt (Khajna)' },
  { value: 'UTILITY_BILL', label: 'Utility bill' },
  { value: 'OTHER', label: 'Other' },
];

/** Default map centre: Dhaka */
export const DEFAULT_MAP_CENTER: [number, number] = [23.8103, 90.4125];
