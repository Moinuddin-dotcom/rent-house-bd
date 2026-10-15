import { BadGatewayException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Sends SMS through any HTTP gateway (BulkSMSBD, SSL Wireless, …) configured as a URL template
 * containing `{to}` and `{message}` placeholders. Without one, messages are only logged (dev only).
 */
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly config: ConfigService) {}

  get isConfigured() {
    return !!this.config.get<string>('sms.apiUrl');
  }

  async send(to: string, message: string) {
    const template = this.config.get<string>('sms.apiUrl');
    if (!template) {
      if (this.config.get<string>('nodeEnv') === 'production') {
        throw new ServiceUnavailableException('SMS is not configured');
      }
      this.logger.warn(`SMS_API_URL is not set — SMS to ${to} not sent: "${message}"`);
      return;
    }

    const url = template.replace('{to}', encodeURIComponent(to)).replace('{message}', encodeURIComponent(message));
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    } catch (error) {
      this.logger.error(`SMS to ${to} failed`, error as Error);
      throw new BadGatewayException('Could not send SMS, please try again later');
    }
  }
}
