import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export const ACCOUNT_TYPES = ['RENTER', 'OWNER'] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: '01712345678' })
  @IsOptional()
  @Matches(/^\+?[0-9]{10,15}$/, { message: 'phone must be a valid phone number' })
  phone?: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @ApiProperty({ enum: ACCOUNT_TYPES, default: 'RENTER' })
  @IsIn(ACCOUNT_TYPES)
  accountType: AccountType = 'RENTER';
}
