import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ListingPurpose, ListingStatus, Prisma, Role, VideoStatus } from '@prisma/client';
import { unlink } from 'fs/promises';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { paginate } from '../../common/dto/pagination.dto';
import {
  assertFiles,
  IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  VIDEO_MIME_TYPES,
} from '../../common/utils/file-validation';
import { PrismaService } from '../../prisma/prisma.service';
import { OwnersService } from '../owners/owners.service';
import { StorageService } from '../storage/storage.service';
import { YoutubeService } from '../youtube/youtube.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { ListingQueryDto } from './dto/listing-query.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

export const MAX_IMAGES_PER_LISTING = 20;
export const MAX_VIDEOS_PER_LISTING = 3;

/** Fields safe to show to anyone. Contact details are deliberately excluded. */
const publicListingSelect = {
  id: true,
  title: true,
  description: true,
  propertyType: true,
  purpose: true,
  status: true,
  rentAmount: true,
  bedrooms: true,
  bathrooms: true,
  areaSqft: true,
  floor: true,
  furnished: true,
  availableFrom: true,
  division: true,
  district: true,
  area: true,
  address: true,
  latitude: true,
  longitude: true,
  createdAt: true,
  updatedAt: true,
  owner: { select: { id: true, name: true } },
  images: { orderBy: { position: 'asc' }, select: { id: true, url: true, position: true } },
  videos: {
    where: { status: VideoStatus.READY },
    select: { id: true, youtubeId: true, status: true },
  },
} satisfies Prisma.ListingSelect;

const contactSelect = {
  phoneNumbers: true,
  whatsappNumber: true,
  contactEmail: true,
} satisfies Prisma.ListingSelect;

@Injectable()
export class ListingsService {
  private readonly logger = new Logger(ListingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly owners: OwnersService,
    private readonly storage: StorageService,
    private readonly youtube: YoutubeService,
  ) {}

  // ---------------------------------------------------------------- public

  async search(query: ListingQueryDto) {
    const { page, limit } = query;
    const where = this.buildWhere(query);
    const orderBy: Prisma.ListingOrderByWithRelationInput =
      query.sort === 'rent_asc'
        ? { rentAmount: 'asc' }
        : query.sort === 'rent_desc'
          ? { rentAmount: 'desc' }
          : { createdAt: 'desc' };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.listing.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          ...publicListingSelect,
          description: false,
          videos: false,
          images: { orderBy: { position: 'asc' }, take: 1, select: { id: true, url: true, position: true } },
        },
      }),
      this.prisma.listing.count({ where }),
    ]);
    return paginate(data, total, page, limit);
  }

  async findPublic(id: string) {
    const listing = await this.prisma.listing.findFirst({
      where: { id, status: { in: [ListingStatus.ACTIVE, ListingStatus.RENTED] } },
      select: publicListingSelect,
    });
    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  /** Contact details are only available to registered (logged-in) users. */
  async getContact(id: string) {
    const listing = await this.prisma.listing.findFirst({
      where: { id, status: ListingStatus.ACTIVE },
      select: { ...contactSelect, owner: { select: { name: true } } },
    });
    if (!listing) throw new NotFoundException('Listing not found or no longer available');
    return listing;
  }

  // ----------------------------------------------------------------- owner

  async findMine(ownerId: string) {
    return this.prisma.listing.findMany({
      where: { ownerId, status: { not: ListingStatus.REMOVED } },
      orderBy: { createdAt: 'desc' },
      select: {
        ...publicListingSelect,
        ...contactSelect,
        videos: { select: { id: true, youtubeId: true, status: true, errorMessage: true } },
      },
    });
  }

  async findOwned(id: string, user: AuthUser) {
    await this.getOwnedOrThrow(id, user);
    return this.prisma.listing.findUniqueOrThrow({
      where: { id },
      select: {
        ...publicListingSelect,
        ...contactSelect,
        videos: { select: { id: true, youtubeId: true, status: true, errorMessage: true } },
      },
    });
  }

  async create(ownerId: string, dto: CreateListingDto) {
    await this.owners.assertApprovedOwner(ownerId);
    this.assertPurposeAllowed(dto.purpose);

    return this.prisma.listing.create({
      data: {
        ...dto,
        purpose: ListingPurpose.RENT,
        availableFrom: dto.availableFrom ? new Date(dto.availableFrom) : undefined,
        ownerId,
      },
    });
  }

  async update(id: string, user: AuthUser, dto: UpdateListingDto) {
    await this.getOwnedOrThrow(id, user);
    this.assertPurposeAllowed(dto.purpose);

    return this.prisma.listing.update({
      where: { id },
      data: {
        ...dto,
        availableFrom: dto.availableFrom ? new Date(dto.availableFrom) : undefined,
      },
    });
  }

  async updateStatus(id: string, user: AuthUser, status: ListingStatus) {
    const listing = await this.getOwnedOrThrow(id, user);
    if (listing.status === ListingStatus.REMOVED && user.role !== Role.ADMIN) {
      throw new ForbiddenException('This listing was removed by an admin');
    }
    return this.prisma.listing.update({ where: { id }, data: { status } });
  }

  async remove(id: string, user: AuthUser) {
    await this.getOwnedOrThrow(id, user);
    const listing = await this.prisma.listing.delete({
      where: { id },
      include: { images: true, videos: true },
    });
    await Promise.all([
      ...listing.images.map((img) => this.storage.delete(img.s3Key)),
      ...listing.videos.filter((v) => v.youtubeId).map((v) => this.youtube.delete(v.youtubeId!)),
    ]);
    return { success: true };
  }

  // ----------------------------------------------------------------- media

  async addImages(id: string, user: AuthUser, files: Express.Multer.File[]) {
    await this.getOwnedOrThrow(id, user);
    assertFiles(files, IMAGE_MIME_TYPES, MAX_IMAGE_SIZE, 'image');

    const existing = await this.prisma.listingImage.count({ where: { listingId: id } });
    if (existing + files.length > MAX_IMAGES_PER_LISTING) {
      throw new BadRequestException(`A listing can have at most ${MAX_IMAGES_PER_LISTING} images`);
    }

    const uploaded = await Promise.all(files.map((file) => this.storage.upload(file, `listings/${id}`)));
    await this.prisma.listingImage.createMany({
      data: uploaded.map((obj, i) => ({ listingId: id, s3Key: obj.key, url: obj.url, position: existing + i })),
    });
    return this.prisma.listingImage.findMany({ where: { listingId: id }, orderBy: { position: 'asc' } });
  }

  async removeImage(id: string, imageId: string, user: AuthUser) {
    await this.getOwnedOrThrow(id, user);
    const image = await this.prisma.listingImage.findFirst({ where: { id: imageId, listingId: id } });
    if (!image) throw new NotFoundException('Image not found');
    await this.prisma.listingImage.delete({ where: { id: imageId } });
    await this.storage.delete(image.s3Key);
    return { success: true };
  }

  /**
   * Accepts a video uploaded from the owner's phone, then pushes it to YouTube in the background.
   * The record starts as PROCESSING and flips to READY (with youtubeId) or FAILED.
   */
  async addVideo(id: string, user: AuthUser, file: Express.Multer.File | undefined) {
    try {
      const listing = await this.getOwnedOrThrow(id, user);
      this.youtube.assertEnabled();
      assertFiles(file ? [file] : undefined, VIDEO_MIME_TYPES, MAX_VIDEO_SIZE, 'video');

      const count = await this.prisma.listingVideo.count({
        where: { listingId: id, status: { not: VideoStatus.FAILED } },
      });
      if (count >= MAX_VIDEOS_PER_LISTING) {
        throw new BadRequestException(`A listing can have at most ${MAX_VIDEOS_PER_LISTING} videos`);
      }

      const video = await this.prisma.listingVideo.create({ data: { listingId: id } });
      void this.pushVideoToYoutube(video.id, file!.path, listing.title, listing.description);
      return video;
    } catch (error) {
      if (file?.path) await unlink(file.path).catch(() => undefined);
      throw error;
    }
  }

  async removeVideo(id: string, videoId: string, user: AuthUser) {
    await this.getOwnedOrThrow(id, user);
    const video = await this.prisma.listingVideo.findFirst({ where: { id: videoId, listingId: id } });
    if (!video) throw new NotFoundException('Video not found');
    await this.prisma.listingVideo.delete({ where: { id: videoId } });
    if (video.youtubeId) await this.youtube.delete(video.youtubeId);
    return { success: true };
  }

  private async pushVideoToYoutube(videoId: string, filePath: string, title: string, description: string) {
    try {
      const youtubeId = await this.youtube.upload({
        filePath,
        title: `${title} | Rent House BD`,
        description,
      });
      await this.prisma.listingVideo.update({
        where: { id: videoId },
        data: { youtubeId, status: VideoStatus.READY },
      });
    } catch (error) {
      this.logger.error(`YouTube upload failed for video ${videoId}`, error as Error);
      await this.prisma.listingVideo
        .update({
          where: { id: videoId },
          data: { status: VideoStatus.FAILED, errorMessage: (error as Error).message?.slice(0, 500) },
        })
        .catch(() => undefined);
    } finally {
      await unlink(filePath).catch(() => undefined);
    }
  }

  // --------------------------------------------------------------- helpers

  private async getOwnedOrThrow(id: string, user: AuthUser) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.ownerId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('You can only manage your own listings');
    }
    return listing;
  }

  /** Sale listings are reserved for the future premium membership. */
  private assertPurposeAllowed(purpose?: ListingPurpose) {
    if (purpose === ListingPurpose.SALE) {
      throw new BadRequestException('Sale listings are not available yet — coming with premium membership');
    }
  }

  private buildWhere(q: ListingQueryDto): Prisma.ListingWhereInput {
    const where: Prisma.ListingWhereInput = {
      status: ListingStatus.ACTIVE,
      purpose: ListingPurpose.RENT,
    };
    const and: Prisma.ListingWhereInput[] = [];

    if (q.propertyType) where.propertyType = q.propertyType;
    if (q.division) where.division = { equals: q.division, mode: 'insensitive' };
    if (q.district) where.district = { equals: q.district, mode: 'insensitive' };
    if (q.area) where.area = { contains: q.area, mode: 'insensitive' };
    if (q.bedrooms !== undefined) where.bedrooms = { gte: q.bedrooms };
    if (q.bathrooms !== undefined) where.bathrooms = { gte: q.bathrooms };
    if (q.furnished !== undefined) where.furnished = q.furnished;
    if (q.minRent !== undefined || q.maxRent !== undefined) {
      where.rentAmount = {
        ...(q.minRent !== undefined ? { gte: q.minRent } : {}),
        ...(q.maxRent !== undefined ? { lte: q.maxRent } : {}),
      };
    }
    if (q.q) {
      and.push({
        OR: [
          { title: { contains: q.q, mode: 'insensitive' } },
          { area: { contains: q.q, mode: 'insensitive' } },
          { district: { contains: q.q, mode: 'insensitive' } },
          { address: { contains: q.q, mode: 'insensitive' } },
        ],
      });
    }
    if ([q.north, q.south, q.east, q.west].every((v) => v !== undefined)) {
      and.push({
        latitude: { gte: q.south, lte: q.north },
        longitude: { gte: q.west, lte: q.east },
      });
    }
    if (and.length) where.AND = and;
    return where;
  }
}
