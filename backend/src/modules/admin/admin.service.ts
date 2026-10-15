import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ListingStatus, Prisma, VerificationStatus } from '@prisma/client';
import { paginate } from '../../common/dto/pagination.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AdminListingQueryDto, OwnerRequestQueryDto } from './dto/admin-query.dto';
import { ReviewOwnerDto } from './dto/review-owner.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async stats() {
    const [pendingOwners, approvedOwners, activeListings, renters] = await Promise.all([
      this.prisma.ownerProfile.count({ where: { status: VerificationStatus.PENDING } }),
      this.prisma.ownerProfile.count({ where: { status: VerificationStatus.APPROVED } }),
      this.prisma.listing.count({ where: { status: ListingStatus.ACTIVE } }),
      this.prisma.user.count({ where: { role: 'RENTER' } }),
    ]);
    return { pendingOwners, approvedOwners, activeListings, renters };
  }

  async listOwnerRequests({ status, page, limit }: OwnerRequestQueryDto) {
    const where: Prisma.OwnerProfileWhereInput = status ? { status } : {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.ownerProfile.findMany({
        where,
        orderBy: { submittedAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { documents: true } },
        },
      }),
      this.prisma.ownerProfile.count({ where }),
    ]);
    return paginate(data, total, page, limit);
  }

  async getOwnerRequest(id: string) {
    const profile = await this.prisma.ownerProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, phoneVerifiedAt: true, createdAt: true } },
        reviewedBy: { select: { id: true, name: true } },
        documents: true,
      },
    });
    if (!profile) throw new NotFoundException('Owner request not found');

    const documents = await Promise.all(
      profile.documents.map(async ({ s3Key, ...doc }) => ({
        ...doc,
        url: await this.storage.getSignedDownloadUrl(s3Key),
      })),
    );
    return { ...profile, documents };
  }

  async reviewOwnerRequest(id: string, adminId: string, dto: ReviewOwnerDto) {
    const profile = await this.prisma.ownerProfile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundException('Owner request not found');
    if (profile.status !== VerificationStatus.PENDING) {
      throw new ConflictException(`This request has already been ${profile.status.toLowerCase()}`);
    }

    return this.prisma.ownerProfile.update({
      where: { id },
      data: {
        status: dto.decision as VerificationStatus,
        reviewNote: dto.note ?? null,
        reviewedById: adminId,
        reviewedAt: new Date(),
      },
    });
  }

  async listListings({ status, q, page, limit }: AdminListingQueryDto) {
    const where: Prisma.ListingWhereInput = {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { area: { contains: q, mode: 'insensitive' } },
              { owner: { email: { contains: q, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.listing.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { owner: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.listing.count({ where }),
    ]);
    return paginate(data, total, page, limit);
  }

  updateListingStatus(id: string, status: ListingStatus) {
    return this.prisma.listing.update({ where: { id }, data: { status } });
  }
}
