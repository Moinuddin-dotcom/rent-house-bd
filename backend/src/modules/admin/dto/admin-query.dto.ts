import { ApiPropertyOptional } from '@nestjs/swagger';
import { ListingStatus, VerificationStatus } from '@prisma/client';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class OwnerRequestQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: VerificationStatus })
  @IsOptional()
  @IsEnum(VerificationStatus)
  status?: VerificationStatus;
}

export class AdminListingQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ListingStatus })
  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;
}

export class UpdateListingStatusDto {
  @IsIn([ListingStatus.ACTIVE, ListingStatus.INACTIVE, ListingStatus.REMOVED])
  status!: ListingStatus;
}
