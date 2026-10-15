export type Role = 'RENTER' | 'OWNER' | 'ADMIN';
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type PropertyType = 'FLAT' | 'HOUSE' | 'ROOM' | 'SUBLET';
export type ListingStatus = 'ACTIVE' | 'INACTIVE' | 'RENTED' | 'REMOVED';
export type VideoStatus = 'PROCESSING' | 'READY' | 'FAILED';
export type DocumentType =
  | 'NATIONAL_ID'
  | 'NATIONAL_ID_BACK'
  | 'SELFIE_WITH_NID'
  | 'PASSPORT'
  | 'OWNERSHIP_DEED'
  | 'MUTATION_KHATIAN'
  | 'DCR'
  | 'LAND_TAX_RECEIPT'
  | 'HOLDING_TAX_RECEIPT'
  | 'UTILITY_BILL'
  | 'WARISH_CERTIFICATE'
  | 'ALLOTMENT_LETTER'
  | 'POWER_OF_ATTORNEY'
  | 'OTHER';
export type ZoneType = 'RESIDENTIAL' | 'COMMERCIAL' | 'NON_RESIDENTIAL';
export type OwnershipType = 'SELF' | 'INHERITED' | 'DEVELOPER_PURCHASE' | 'REPRESENTATIVE';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  phoneVerifiedAt: string | null;
  role: Role;
  createdAt: string;
  ownerVerificationStatus?: VerificationStatus | null;
  ownerReviewNote?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface ListingImage {
  id: string;
  url: string;
  position: number;
}

export interface ListingVideo {
  id: string;
  youtubeId: string | null;
  status: VideoStatus;
  errorMessage?: string | null;
}

export interface ListingSummary {
  id: string;
  title: string;
  propertyType: PropertyType;
  status: ListingStatus;
  rentAmount: number;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number | null;
  area: string;
  district: string;
  division: string;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
  updatedAt?: string;
  images: ListingImage[];
}

export interface Listing extends ListingSummary {
  description: string;
  floor: number | null;
  furnished: boolean;
  availableFrom: string | null;
  address: string;
  owner: { id: string; name: string };
  videos: ListingVideo[];
}

export interface ListingContact {
  phoneNumbers: string[];
  whatsappNumber: string;
  contactEmail: string;
  owner: { name: string };
}

export type OwnedListing = Listing & Omit<ListingContact, 'owner'>;

export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface OwnershipDocument {
  id: string;
  type: DocumentType;
  fileName: string;
  mimeType?: string;
  uploadedAt: string;
  url?: string;
}

export interface OwnerProfile {
  id: string;
  userId: string;
  fullName: string;
  nationalIdNumber: string;
  phone: string;
  addressDivision: string | null;
  addressDistrict: string | null;
  addressArea: string | null;
  addressZone: ZoneType | null;
  addressZoneName: string | null;
  address: string;
  propertyDivision: string | null;
  propertyDistrict: string | null;
  propertyArea: string | null;
  propertyZone: ZoneType | null;
  propertyZoneName: string | null;
  propertyAddress: string;
  ownershipType: OwnershipType;
  notes: string | null;
  status: VerificationStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
  submittedAt: string;
  documents?: OwnershipDocument[];
  user?: { id: string; name: string; email: string; phone?: string | null; phoneVerifiedAt?: string | null };
  _count?: { documents: number };
}

export interface AdminStats {
  pendingOwners: number;
  approvedOwners: number;
  activeListings: number;
  renters: number;
}

export interface AdminListing extends ListingSummary {
  owner: { id: string; name: string; email: string };
}
