import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType, OwnershipType, ZoneType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

/**
 * Sent as multipart/form-data together with the `documents` files.
 * `documentTypes[i]` describes `documents[i]`.
 */
export class SubmitVerificationDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName!: string;

  @ApiProperty({ description: 'Bangladesh National ID (NID) number: 10, 13 or 17 digits' })
  @Matches(/^(\d{10}|\d{13}|\d{17})$/, { message: 'nationalIdNumber must be 10, 13 or 17 digits' })
  nationalIdNumber!: string;

  @ApiProperty()
  @Matches(/^\+?[0-9]{10,15}$/, { message: 'phone must be a valid phone number' })
  phone!: string;

  @ApiProperty({ example: 'Dhaka', description: 'Present address: division' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  addressDivision!: string;

  @ApiProperty({ example: 'Dhaka', description: 'Present address: district' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  addressDistrict!: string;

  @ApiProperty({ example: 'Mirpur', description: 'Present address: area (upazila / thana)' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  addressArea!: string;

  @ApiProperty({ enum: ZoneType, description: 'Present address: residential, commercial or non-residential zone' })
  @IsEnum(ZoneType)
  addressZone!: ZoneType;

  @ApiProperty({ example: 'Kolpolok R/A', description: 'Present address: name of the zone' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  addressZoneName!: string;

  @ApiProperty({ description: 'Present address details: building, floor, flat, block, plot, road' })
  @IsString()
  @MinLength(5)
  @MaxLength(300)
  address!: string;

  @ApiProperty({ example: 'Dhaka', description: 'Property location: division' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  propertyDivision!: string;

  @ApiProperty({ example: 'Dhaka', description: 'Property location: district' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  propertyDistrict!: string;

  @ApiProperty({ example: 'Mirpur', description: 'Property location: area (upazila / thana)' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  propertyArea!: string;

  @ApiProperty({ enum: ZoneType, description: 'Property location: residential, commercial or non-residential zone' })
  @IsEnum(ZoneType)
  propertyZone!: ZoneType;

  @ApiProperty({ example: 'Kolpolok R/A', description: 'Property location: name of the zone' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  propertyZoneName!: string;

  @ApiProperty({ description: 'Property details: building, floor, flat, block, plot, road' })
  @IsString()
  @MinLength(5)
  @MaxLength(300)
  propertyAddress!: string;

  @ApiProperty({ enum: OwnershipType, description: 'Decides which extra documents are required' })
  @IsEnum(OwnershipType)
  ownershipType!: OwnershipType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiProperty({
    enum: DocumentType,
    isArray: true,
    description: 'Must include every type in REQUIRED_DOCUMENTS[ownershipType] (see owners.service.ts)',
  })
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [value];
      } catch {
        return value.split(',').map((v) => v.trim());
      }
    }
    return value;
  })
  @IsArray()
  @ArrayMinSize(7)
  @IsEnum(DocumentType, { each: true })
  documentTypes!: DocumentType[];
}
