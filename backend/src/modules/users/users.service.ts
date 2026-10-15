import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type PublicUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  toPublic(user: User): PublicUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...rest } = user;
    return rest;
  }

  async getProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { ownerProfile: { select: { status: true, reviewNote: true } } },
    });
    if (!user) throw new NotFoundException('User not found');

    const { ownerProfile, ...rest } = user;
    return {
      ...this.toPublic(rest),
      ownerVerificationStatus: ownerProfile?.status ?? null,
      ownerReviewNote: ownerProfile?.reviewNote ?? null,
    };
  }
}
