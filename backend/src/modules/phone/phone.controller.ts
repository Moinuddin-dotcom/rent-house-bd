import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { SendCodeDto } from './dto/send-code.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { PhoneService } from './phone.service';

@ApiTags('phone')
@ApiBearerAuth()
@Controller('phone')
export class PhoneController {
  constructor(private readonly phone: PhoneService) {}

  @Post('send-code')
  @HttpCode(200)
  @Throttle({ default: { ttl: 60 * 60_000, limit: 5 } })
  sendCode(@CurrentUser() user: AuthUser, @Body() dto: SendCodeDto) {
    return this.phone.sendCode(user.id, dto.phone);
  }

  @Post('verify')
  @HttpCode(200)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  verify(@CurrentUser() user: AuthUser, @Body() dto: VerifyCodeDto) {
    return this.phone.verifyCode(user.id, dto.phone, dto.code);
  }
}
