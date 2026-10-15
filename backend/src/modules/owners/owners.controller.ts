import { Body, Controller, Get, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { MAX_DOCUMENT_SIZE } from '../../common/utils/file-validation';
import { SubmitVerificationDto } from './dto/submit-verification.dto';
import { OwnersService } from './owners.service';

@ApiTags('owners')
@ApiBearerAuth()
@Roles(Role.OWNER)
@Controller('owners/verification')
export class OwnersController {
  constructor(private readonly owners: OwnersService) {}

  @Get('me')
  getMine(@CurrentUser() user: AuthUser) {
    return this.owners.getMyVerification(user.id);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('documents', 15, { limits: { fileSize: MAX_DOCUMENT_SIZE } }))
  submit(
    @CurrentUser() user: AuthUser,
    @Body() dto: SubmitVerificationDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.owners.submitVerification(user.id, dto, files);
  }
}
