import { PartialType } from '@nestjs/swagger';
import { ListingStatus } from '@prisma/client';
import { IsIn } from 'class-validator';
import { CreateListingDto } from './create-listing.dto';

export class UpdateListingDto extends PartialType(CreateListingDto) {}

/** Statuses an owner may set on their own listing (REMOVED is admin-only). */
export const OWNER_SETTABLE_STATUSES = [ListingStatus.ACTIVE, ListingStatus.INACTIVE, ListingStatus.RENTED] as const;

export class UpdateOwnListingStatusDto {
  @IsIn(OWNER_SETTABLE_STATUSES)
  status!: (typeof OWNER_SETTABLE_STATUSES)[number];
}
