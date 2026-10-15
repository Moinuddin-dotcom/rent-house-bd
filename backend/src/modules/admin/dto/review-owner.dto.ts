import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';

export const REVIEW_DECISIONS = ['APPROVED', 'REJECTED'] as const;

export class ReviewOwnerDto {
  @ApiProperty({ enum: REVIEW_DECISIONS })
  @IsIn(REVIEW_DECISIONS)
  decision!: (typeof REVIEW_DECISIONS)[number];

  @ApiPropertyOptional({ description: 'Required when rejecting; shown to the owner' })
  @ValidateIf((o: ReviewOwnerDto) => o.decision === 'REJECTED' || o.note != null)
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  note?: string;
}
