import { Injectable, NotFoundException } from '@nestjs/common';
import { ListingStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            propertyType: true,
            status: true,
            rentAmount: true,
            bedrooms: true,
            bathrooms: true,
            areaSqft: true,
            area: true,
            district: true,
            division: true,
            createdAt: true,
            images: { orderBy: { position: 'asc' }, take: 1, select: { id: true, url: true, position: true } },
          },
        },
      },
    });
    return favorites.map((f) => f.listing);
  }

  async ids(userId: string) {
    const rows = await this.prisma.favorite.findMany({ where: { userId }, select: { listingId: true } });
    return rows.map((r) => r.listingId);
  }

  async add(userId: string, listingId: string) {
    const listing = await this.prisma.listing.findFirst({
      where: { id: listingId, status: ListingStatus.ACTIVE },
      select: { id: true },
    });
    if (!listing) throw new NotFoundException('Listing not found');

    await this.prisma.favorite.upsert({
      where: { userId_listingId: { userId, listingId } },
      update: {},
      create: { userId, listingId },
    });
    return { success: true };
  }

  async remove(userId: string, listingId: string) {
    await this.prisma.favorite.deleteMany({ where: { userId, listingId } });
    return { success: true };
  }
}
