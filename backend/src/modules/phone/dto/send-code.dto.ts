import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class SendCodeDto {
  @ApiProperty({ example: '01712345678' })
  @Matches(/^(\+?880|0)1[3-9]\d{8}$/, { message: 'phone must be a valid Bangladeshi mobile number' })
  phone!: string;
}
