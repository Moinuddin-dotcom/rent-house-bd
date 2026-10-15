import type { DocumentType, OwnershipType, PropertyType, ZoneType } from '@/types';

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

export const DOCUMENT_TYPES: { value: DocumentType; label: string; hint: string; imageOnly?: boolean }[] = [
  { value: 'NATIONAL_ID', label: 'National ID (NID), front', hint: 'Clear photo or scan of the front of your NID card.' },
  { value: 'NATIONAL_ID_BACK', label: 'National ID (NID), back', hint: 'Clear photo or scan of the back of your NID card.' },
  {
    value: 'SELFIE_WITH_NID',
    label: 'Selfie holding your NID',
    hint: 'A photo of your face holding your NID next to it. Both must be clearly visible.',
    imageOnly: true,
  },
  { value: 'PASSPORT', label: 'Passport', hint: 'Photo page of your passport.' },
  {
    value: 'OWNERSHIP_DEED',
    label: 'Ownership deed / Dolil',
    hint: 'Registered deed for the property. Bought from a developer and not registered yet? Upload the sale agreement (bayna).',
  },
  { value: 'MUTATION_KHATIAN', label: 'Mutation khatian (Namjari)', hint: 'Khatian showing the land recorded in the owner’s name.' },
  { value: 'DCR', label: 'DCR (Duplicate Carbon Receipt)', hint: 'Receipt issued with the mutation (namjari).' },
  { value: 'LAND_TAX_RECEIPT', label: 'Land tax receipt (Khajna)', hint: 'Latest land development tax receipt.' },
  {
    value: 'HOLDING_TAX_RECEIPT',
    label: 'Holding tax receipt',
    hint: 'Latest City Corporation / Pourashava holding tax receipt for the building.',
  },
  { value: 'UTILITY_BILL', label: 'Utility bill', hint: 'Recent electricity, gas or water bill for the property.' },
  {
    value: 'WARISH_CERTIFICATE',
    label: 'Warish (inheritance) certificate',
    hint: 'Issued by the Union Parishad / City Corporation, listing you as an heir of the deed owner.',
  },
  {
    value: 'ALLOTMENT_LETTER',
    label: 'Allotment / handover letter',
    hint: 'Letter from the developer allotting or handing the flat over to you.',
  },
  {
    value: 'POWER_OF_ATTORNEY',
    label: 'Power of attorney / authorization letter',
    hint: 'Signed by the owner, allowing you to rent out the property on their behalf.',
  },
  { value: 'OTHER', label: 'Other', hint: 'Any other supporting document.' },
];

/** Shown in the (i) tooltip: why we ask the owner for each document. */
export const DOCUMENT_REASONS: Record<DocumentType, string> = {
  NATIONAL_ID:
    'Proves who you are. We match the name and photo with your deed and your selfie, so nobody can register in your name.',
  NATIONAL_ID_BACK:
    'The back of the card has your address and security details, which help us confirm the NID is genuine.',
  SELFIE_WITH_NID:
    'Proves the NID belongs to you and is not a photo of someone else’s card. We compare your face with the NID photo.',
  PASSPORT: 'An extra identity proof, useful if details on your NID are hard to read.',
  OWNERSHIP_DEED:
    'The main legal proof of who owns the property. The owner’s name on it must match your NID (or the owner you represent).',
  MUTATION_KHATIAN:
    'Shows the property is recorded in the owner’s name in government land records today. A deed can be old, or the property may have been sold since.',
  DCR: 'The government receipt issued with the mutation (namjari). It confirms the mutation is genuine.',
  LAND_TAX_RECEIPT:
    'Shows land tax is being paid on this property now, which means the ownership is active and up to date.',
  HOLDING_TAX_RECEIPT:
    'Shows the City Corporation / Pourashava has assessed the building at this address to the owner.',
  UTILITY_BILL: 'Confirms the property address and that it is a real, existing property.',
  WARISH_CERTIFICATE:
    'The deed is in a deceased relative’s name, so this certificate proves you are their legal heir and can rent it out.',
  ALLOTMENT_LETTER:
    'Proves the developer sold or handed this flat over to you, even if the deed is not registered in your name yet.',
  POWER_OF_ATTORNEY:
    'Proves the owner has allowed you to rent the property out for them. Without it, anyone could list someone else’s property.',
  OTHER: 'Any extra proof that helps our reviewers confirm your identity or ownership.',
};

/** Stored as `ZoneType` in the API, but shown to users as an "area" type. */
export const ZONE_TYPES: { value: ZoneType; label: string; description: string; example: string }[] = [
  { value: 'RESIDENTIAL', label: 'Residential area', description: 'Mainly homes and apartments', example: 'Kolpolok R/A' },
  { value: 'COMMERCIAL', label: 'Commercial area', description: 'Shops, offices and markets', example: 'Motijheel C/A' },
  {
    value: 'NON_RESIDENTIAL',
    label: 'Non-residential area',
    description: 'Industrial, institutional or other',
    example: 'Tejgaon I/A',
  },
];

export const OWNERSHIP_TYPES: { value: OwnershipType; label: string; description: string }[] = [
  { value: 'SELF', label: 'I own it', description: 'The deed and mutation are in my name.' },
  { value: 'INHERITED', label: 'I inherited it', description: 'The deed is in a deceased relative’s name.' },
  { value: 'DEVELOPER_PURCHASE', label: 'Bought from a developer', description: 'A flat allotted or handed over by a developer.' },
  { value: 'REPRESENTATIVE', label: 'Listing for the owner', description: 'I am a relative, manager or caretaker acting for the owner.' },
];

const ALWAYS_REQUIRED: DocumentType[] = [
  'NATIONAL_ID',
  'NATIONAL_ID_BACK',
  'SELFIE_WITH_NID',
  'OWNERSHIP_DEED',
  'LAND_TAX_RECEIPT',
  'UTILITY_BILL',
];

/** Required documents by ownership type. Mirrors REQUIRED_DOCUMENTS in backend owners.service.ts. */
export const REQUIRED_DOCUMENTS: Record<OwnershipType, DocumentType[]> = {
  SELF: [...ALWAYS_REQUIRED, 'MUTATION_KHATIAN'],
  INHERITED: [...ALWAYS_REQUIRED, 'WARISH_CERTIFICATE'],
  DEVELOPER_PURCHASE: [...ALWAYS_REQUIRED, 'ALLOTMENT_LETTER'],
  REPRESENTATIVE: [...ALWAYS_REQUIRED, 'MUTATION_KHATIAN', 'POWER_OF_ATTORNEY'],
};

/** Named, optional upload slots shown under the required ones. */
export const RECOMMENDED_DOCUMENTS: DocumentType[] = ['DCR', 'HOLDING_TAX_RECEIPT'];

/** Default map centre: Dhaka */
export const DEFAULT_MAP_CENTER: [number, number] = [23.8103, 90.4125];
