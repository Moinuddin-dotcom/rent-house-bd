import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream } from 'fs';
import { google, youtube_v3 } from 'googleapis';

export interface YoutubeUploadInput {
  filePath: string;
  title: string;
  description: string;
}

/**
 * Pushes owner-uploaded videos to the platform's YouTube channel (unlisted by default)
 * so they can be embedded on listing pages without hosting video ourselves.
 *
 * Requires an OAuth client + refresh token for the channel that owns the uploads.
 */
@Injectable()
export class YoutubeService {
  private readonly logger = new Logger(YoutubeService.name);
  private readonly youtube: youtube_v3.Youtube | null;
  private readonly privacyStatus: string;

  constructor(config: ConfigService) {
    const clientId = config.get<string>('youtube.clientId', '');
    const clientSecret = config.get<string>('youtube.clientSecret', '');
    const refreshToken = config.get<string>('youtube.refreshToken', '');
    this.privacyStatus = config.get<string>('youtube.privacyStatus', 'unlisted');

    if (clientId && clientSecret && refreshToken) {
      const auth = new google.auth.OAuth2(clientId, clientSecret);
      auth.setCredentials({ refresh_token: refreshToken });
      this.youtube = google.youtube({ version: 'v3', auth });
    } else {
      this.youtube = null;
      this.logger.warn('YouTube credentials are not set — video uploads are disabled');
    }
  }

  get isEnabled() {
    return this.youtube !== null;
  }

  assertEnabled() {
    if (!this.youtube) {
      throw new ServiceUnavailableException('Video uploads are not configured');
    }
  }

  /** Uploads a video file and returns the YouTube video id. */
  async upload({ filePath, title, description }: YoutubeUploadInput): Promise<string> {
    this.assertEnabled();
    const response = await this.youtube!.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: { title: title.slice(0, 100), description: description.slice(0, 5000), categoryId: '19' },
        status: { privacyStatus: this.privacyStatus, selfDeclaredMadeForKids: false },
      },
      media: { body: createReadStream(filePath) },
    });

    const id = response.data.id;
    if (!id) throw new Error('YouTube did not return a video id');
    return id;
  }

  async delete(videoId: string) {
    if (!this.youtube) return;
    try {
      await this.youtube.videos.delete({ id: videoId });
    } catch (error) {
      this.logger.error(`Failed to delete YouTube video ${videoId}`, error as Error);
    }
  }
}
