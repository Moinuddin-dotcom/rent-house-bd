import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ListingPurpose, PropertyType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const PHONE_REGEX = /^\+?[0-9]{10,15}$/;

export class CreateListingDto {
  @ApiProperty({ example: '3 bed flat for rent in Dhanmondi' })
  @IsString()
  @MinLength(5)
  @MaxLength(120)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  description!: string;

  @ApiProperty({ enum: PropertyType })
  @IsEnum(PropertyType)
  propertyType!: PropertyType;

  @ApiPropertyOptional({ enum: ListingPurpose, default: ListingPurpose.RENT })
  @IsOptional()
  @IsEnum(ListingPurpose)
  purpose?: ListingPurpose;

  @ApiProperty({ description: 'Monthly rent in BDT' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  rentAmount!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(50)
  bedrooms!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(50)
  bathrooms!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  areaSqft?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(200)
  floor?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  furnished?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  availableFrom?: string;

  @ApiProperty({ example: 'Dhaka' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  division!: string;

  @ApiProperty({ example: 'Dhaka' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  district!: string;

  @ApiProperty({ example: 'Dhanmondi' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  area!: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  @MaxLength(300)
  address!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsLongitude()
  longitude?: number;

  @ApiProperty({ type: [String], minItems: 1, maxItems: 4, description: '1–4 contact phone numbers' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(4)
  @Matches(PHONE_REGEX, { each: true, message: 'each phone number must be valid' })
  phoneNumbers!: string[];

  @ApiProperty()
  @Matches(PHONE_REGEX, { message: 'whatsappNumber must be a valid phone number' })
  whatsappNumber!: string;

  @ApiProperty()
  @IsEmail()
  contactEmail!: string;
}
