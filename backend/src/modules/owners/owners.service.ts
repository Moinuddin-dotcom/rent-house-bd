import { BadRequestException, ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { VerificationStatus } from '@prisma/client';
import {
  assertFiles,
  DOCUMENT_MIME_TYPES,
  MAX_DOCUMENT_SIZE,
} from '../../common/utils/file-validation';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { SubmitVerificationDto } from './dto/submit-verification.dto';

@Injectable()
export class OwnersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  getMyVerification(userId: string) {
    return this.prisma.ownerProfile.findUnique({
      where: { userId },
      include: { documents: { select: { id: true, type: true, fileName: true, uploadedAt: true } } },
    });
  }

  /**
   * Creates the owner's verification request, or resubmits it after a rejection.
   * Pending or approved requests cannot be resubmitted.
   */
  async submitVerification(userId: string, dto: SubmitVerificationDto, files: Express.Multer.File[]) {
    assertFiles(files, DOCUMENT_MIME_TYPES, MAX_DOCUMENT_SIZE, 'document');
    if (dto.documentTypes.length !== files.length) {
      throw new BadRequestException('documentTypes must have one entry per uploaded document');
    }

    const existing = await this.prisma.ownerProfile.findUnique({
      where: { userId },
      include: { documents: true },
    });
    if (existing?.status === VerificationStatus.PENDING) {
      throw new ConflictException('Your verification request is already under review');
    }
    if (existing?.status === VerificationStatus.APPROVED) {
      throw new ConflictException('Your account is already verified');
    }

    const uploaded = await Promise.all(
      files.map(async (file, i) => {
        const { key } = await this.storage.upload(file, `documents/${userId}`);
        return { type: dto.documentTypes[i], fileName: file.originalname, mimeType: file.mimetype, s3Key: key };
      }),
    );

    const profileData = {
      fullName: dto.fullName,
      nationalIdNumber: dto.nationalIdNumber,
      phone: dto.phone,
      address: dto.address,
      propertyAddress: dto.propertyAddress,
      notes: dto.notes,
      status: VerificationStatus.PENDING,
      reviewNote: null,
      reviewedById: null,
      reviewedAt: null,
      submittedAt: new Date(),
    };

    const profile = await this.prisma.$transaction(async (tx) => {
      if (existing) {
        await tx.ownershipDocument.deleteMany({ where: { ownerProfileId: existing.id } });
        return tx.ownerProfile.update({
          where: { id: existing.id },
          data: { ...profileData, documents: { create: uploaded } },
        });
      }
      return tx.ownerProfile.create({
        data: { ...profileData, userId, documents: { create: uploaded } },
      });
    });

    // Clean up documents from the previous (rejected) request
    if (existing) {
      await Promise.all(existing.documents.map((d) => this.storage.delete(d.s3Key)));
    }

    return this.getMyVerification(profile.userId);
  }

  /** Throws unless the owner has been approved by an admin. */
  async assertApprovedOwner(userId: string) {
    const profile = await this.prisma.ownerProfile.findUnique({ where: { userId }, select: { status: true } });
    if (profile?.status !== VerificationStatus.APPROVED) {
      throw new ForbiddenException('Your owner account must be verified by an admin before posting listings');
    }
  }
}
