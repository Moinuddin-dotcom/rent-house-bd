import { BadRequestException } from '@nestjs/common';

export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const DOCUMENT_MIME_TYPES = [...IMAGE_MIME_TYPES, 'application/pdf'];
export const VIDEO_MIME_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/3gpp', 'video/x-matroska'];

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10 MB
export const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500 MB

export function assertFiles(
  files: Express.Multer.File[] | undefined,
  allowed: string[],
  maxSize: number,
  label: string,
) {
  if (!files || files.length === 0) {
    throw new BadRequestException(`At least one ${label} is required`);
  }
  for (const file of files) {
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException(`${file.originalname}: unsupported ${label} type ${file.mimetype}`);
    }
    if (file.size > maxSize) {
      throw new BadRequestException(`${file.originalname}: ${label} exceeds ${Math.round(maxSize / 1024 / 1024)} MB`);
    }
  }
}
