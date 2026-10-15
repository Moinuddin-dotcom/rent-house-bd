import { Module } from '@nestjs/common';
import { PhoneController } from './phone.controller';
import { PhoneService } from './phone.service';
import { SmsService } from './sms.service';

@Module({
  controllers: [PhoneController],
  providers: [PhoneService, SmsService],
})
export class PhoneModule {}
