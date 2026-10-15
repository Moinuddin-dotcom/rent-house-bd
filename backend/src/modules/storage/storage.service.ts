import { DeleteObjectCommand, PutObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BadGatewayException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { extname } from 'path';

export interface StoredObject {
  key: string;
  url: string;
}

/**
 * AWS S3 wrapper.
 *  - `listings/...`  : public listing photos (served directly / via CDN)
 *  - `documents/...` : private ownership documents (admin-only signed URLs)
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client | null;
  private readonly bucket: string;
  private readonly region: string;
  private readonly publicUrl: string;

  constructor(config: ConfigService) {
    this.bucket = config.get<string>('aws.bucket', '');
    this.region = config.get<string>('aws.region', 'ap-south-1');
    this.publicUrl = config.get<string>('aws.publicUrl', '');
    const accessKeyId = config.get<string>('aws.accessKeyId', '');
    const secretAccessKey = config.get<string>('aws.secretAccessKey', '');

    this.client = this.bucket
      ? new S3Client({
          region: this.region,
          // Fall back to the default AWS credential chain (e.g. IAM role) when keys are not set
          ...(accessKeyId && secretAccessKey ? { credentials: { accessKeyId, secretAccessKey } } : {}),
        })
      : null;

    if (!this.client) {
      this.logger.warn('AWS_S3_BUCKET is not set — file uploads are disabled');
    }
  }

  private getClient(): S3Client {
    if (!this.client) {
      throw new ServiceUnavailableException('File storage is not configured');
    }
    return this.client;
  }

  buildKey(prefix: string, originalName: string) {
    return `${prefix}/${randomUUID()}${extname(originalName).toLowerCase()}`;
  }

  publicUrlFor(key: string) {
    const base = this.publicUrl || `https://${this.bucket}.s3.${this.region}.amazonaws.com`;
    return `${base.replace(/\/$/, '')}/${key}`;
  }

  async upload(file: Express.Multer.File, prefix: string): Promise<StoredObject> {
    const key = this.buildKey(prefix, file.originalname);
    const client = this.getClient();
    try {
      await client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
    } catch (error) {
      this.logger.error(`S3 upload failed for ${key}`, error as Error);
      throw new BadGatewayException('Could not upload file, please try again later');
    }
    return { key, url: this.publicUrlFor(key) };
  }

  /** Short-lived URL for private objects (ownership documents). */
  async getSignedDownloadUrl(key: string, expiresInSeconds = 300): Promise<string> {
    return getSignedUrl(this.getClient(), new GetObjectCommand({ Bucket: this.bucket, Key: key }), {
      expiresIn: expiresInSeconds,
    });
  }

  async delete(key: string): Promise<void> {
    try {
      await this.getClient().send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    } catch (error) {
      this.logger.error(`Failed to delete S3 object ${key}`, error as Error);
    }
  }
}
