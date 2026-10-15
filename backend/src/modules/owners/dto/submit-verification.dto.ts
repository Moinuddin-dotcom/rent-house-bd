import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType } from '@prisma/client';
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

  @ApiProperty({ description: 'National ID (NID) or passport number' })
  @IsString()
  @MinLength(5)
  @MaxLength(30)
  nationalIdNumber!: string;

  @ApiProperty()
  @Matches(/^\+?[0-9]{10,15}$/, { message: 'phone must be a valid phone number' })
  phone!: string;

  @ApiProperty({ description: "Owner's present address" })
  @IsString()
  @MinLength(5)
  @MaxLength(300)
  address!: string;

  @ApiProperty({ description: 'Address of the building / flat / land being claimed' })
  @IsString()
  @MinLength(5)
  @MaxLength(300)
  propertyAddress!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiProperty({ enum: DocumentType, isArray: true })
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
  @ArrayMinSize(1)
  @IsEnum(DocumentType, { each: true })
  documentTypes!: DocumentType[];
}
