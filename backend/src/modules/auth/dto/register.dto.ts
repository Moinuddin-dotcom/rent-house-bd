import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export const ACCOUNT_TYPES = ['RENTER', 'OWNER'] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

/** At least 4 letters, 2 digits and 1 special character, e.g. Abcd@12. At most 72 characters (bcrypt limit). */
export const PASSWORD_PATTERN = /^(?=(?:[^A-Za-z]*[A-Za-z]){4})(?=(?:\D*\d){2})(?=.*[^A-Za-z0-9\s]).{7,72}$/;

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

  @ApiProperty({
    minLength: 7,
    example: 'Abcd@12',
    description: 'At least 4 letters, 2 numbers and 1 special character (at most 72 characters)',
  })
  @IsString()
  @MaxLength(72)
  @Matches(PASSWORD_PATTERN, {
    message: 'password must contain at least 4 letters, 2 numbers and 1 special character (e.g. @ or #)',
  })
  password!: string;

  @ApiProperty({ enum: ACCOUNT_TYPES, default: 'RENTER' })
  @IsIn(ACCOUNT_TYPES)
  accountType: AccountType = 'RENTER';
}
