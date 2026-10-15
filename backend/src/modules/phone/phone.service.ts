import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { normalizePhone } from './phone.utils';
import { SmsService } from './sms.service';

const CODE_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;
/** Fixed code used in development while no SMS gateway is configured. Never used in production. */
const TEST_CODE = '123456';

@Injectable()
export class PhoneService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sms: SmsService,
    private readonly config: ConfigService,
  ) {}

  async sendCode(userId: string, rawPhone: string) {
    const phone = normalizePhone(rawPhone);
    await this.assertPhoneAvailable(userId, phone);

    const last = await this.prisma.phoneOtp.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
    if (last && Date.now() - last.createdAt.getTime() < RESEND_COOLDOWN_MS) {
      throw new HttpException('Please wait a minute before requesting another code', HttpStatus.TOO_MANY_REQUESTS);
    }

    const testMode = this.isTestMode;
    const code = testMode ? TEST_CODE : randomInt(0, 1_000_000).toString().padStart(6, '0');
    await this.prisma.phoneOtp.create({
      data: { userId, phone, codeHash: await bcrypt.hash(code, 8), expiresAt: new Date(Date.now() + CODE_TTL_MS) },
    });
    await this.sms.send(phone, `Your Rent House BD verification code is ${code}. It expires in 5 minutes.`);

    // Tell the developer which code to type, since no SMS is actually sent
    return { sent: true, expiresInSeconds: CODE_TTL_MS / 1000, devCode: testMode ? code : undefined };
  }

  /** Development without an SMS gateway: every code is TEST_CODE. Production always sends real SMS. */
  private get isTestMode() {
    return !this.sms.isConfigured && this.config.get<string>('nodeEnv') !== 'production';
  }

  async verifyCode(userId: string, rawPhone: string, code: string) {
    const phone = normalizePhone(rawPhone);
    const otp = await this.prisma.phoneOtp.findFirst({ where: { userId, phone }, orderBy: { createdAt: 'desc' } });
    if (!otp || otp.expiresAt < new Date() || otp.attempts >= MAX_ATTEMPTS) {
      throw new BadRequestException('Code expired, please request a new one');
    }

    if (!(await bcrypt.compare(code, otp.codeHash))) {
      await this.prisma.phoneOtp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
      throw new BadRequestException('Incorrect code');
    }

    await this.assertPhoneAvailable(userId, phone);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: userId }, data: { phone, phoneVerifiedAt: new Date() } }),
      this.prisma.phoneOtp.deleteMany({ where: { userId } }),
    ]);
    return { phone, verified: true };
  }

  /** A number can only be verified on one account. */
  private async assertPhoneAvailable(userId: string, phone: string) {
    const taken = await this.prisma.user.findFirst({
      where: { phone, phoneVerifiedAt: { not: null }, id: { not: userId } },
      select: { id: true },
    });
    if (taken) throw new ConflictException('This phone number is already verified on another account');
  }
}
