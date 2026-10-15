import { ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsIn, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export const LISTING_SORTS = ['newest', 'rent_asc', 'rent_desc'] as const;

export class ListingQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Free-text search over title, area and address' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ enum: PropertyType })
  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  division?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  area?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minRent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxRent?: number;

  @ApiPropertyOptional({ description: 'Minimum number of bedrooms' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @ApiPropertyOptional({ description: 'Minimum number of bathrooms' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  bathrooms?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value))
  @IsBoolean()
  furnished?: boolean;

  // Map bounding box (all four required for the box to apply)
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  north?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  south?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  east?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  west?: number;

  @ApiPropertyOptional({ enum: LISTING_SORTS, default: 'newest' })
  @IsOptional()
  @IsIn(LISTING_SORTS)
  sort: (typeof LISTING_SORTS)[number] = 'newest';
}
