import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import { SendCodeDto } from './send-code.dto';

export class VerifyCodeDto extends SendCodeDto {
  @ApiProperty({ example: '123456' })
  @Matches(/^\d{6}$/, { message: 'code must be 6 digits' })
  code!: string;
}
