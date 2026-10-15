import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { diskStorage } from 'multer';
import { tmpdir } from 'os';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { MAX_IMAGE_SIZE, MAX_VIDEO_SIZE } from '../../common/utils/file-validation';
import { CreateListingDto } from './dto/create-listing.dto';
import { ListingQueryDto } from './dto/listing-query.dto';
import { UpdateListingDto, UpdateOwnListingStatusDto } from './dto/update-listing.dto';
import { ListingsService, MAX_IMAGES_PER_LISTING } from './listings.service';

@ApiTags('listings')
@Controller('listings')
export class ListingsController {
  constructor(private readonly listings: ListingsService) {}

  // ----------------------------------------------------------- public browse

  @Public()
  @Get()
  search(@Query() query: ListingQueryDto) {
    return this.listings.search(query);
  }

  // -------------------------------------------------------------- owner area
  // (declared before `:id` so "mine" isn't captured as an id)

  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.ADMIN)
  @Get('mine')
  findMine(@CurrentUser() user: AuthUser) {
    return this.listings.findMine(user.id);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listings.findPublic(id);
  }

  /** Any registered user (renter, owner or admin) may see contact details. */
  @ApiBearerAuth()
  @Get(':id/contact')
  getContact(@Param('id') id: string) {
    return this.listings.getContact(id);
  }

  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.ADMIN)
  @Get(':id/manage')
  findOwned(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.listings.findOwned(id, user);
  }

  @ApiBearerAuth()
  @Roles(Role.OWNER)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateListingDto) {
    return this.listings.create(user.id, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser() user: AuthUser, @Body() dto: UpdateListingDto) {
    return this.listings.update(id, user, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.ADMIN)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @CurrentUser() user: AuthUser, @Body() dto: UpdateOwnListingStatusDto) {
    return this.listings.updateStatus(id, user, dto.status);
  }

  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.listings.remove(id, user);
  }

  // ------------------------------------------------------------------- media

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @Roles(Role.OWNER, Role.ADMIN)
  @Post(':id/images')
  @UseInterceptors(FilesInterceptor('images', MAX_IMAGES_PER_LISTING, { limits: { fileSize: MAX_IMAGE_SIZE } }))
  addImages(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.listings.addImages(id, user, files);
  }

  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.ADMIN)
  @Delete(':id/images/:imageId')
  removeImage(@Param('id') id: string, @Param('imageId') imageId: string, @CurrentUser() user: AuthUser) {
    return this.listings.removeImage(id, imageId, user);
  }

  /** Video from the owner's phone gallery → streamed to disk → pushed to YouTube in the background. */
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @Roles(Role.OWNER, Role.ADMIN)
  @Post(':id/videos')
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({ destination: tmpdir() }),
      limits: { fileSize: MAX_VIDEO_SIZE },
    }),
  )
  addVideo(@Param('id') id: string, @CurrentUser() user: AuthUser, @UploadedFile() file?: Express.Multer.File) {
    return this.listings.addVideo(id, user, file);
  }

  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.ADMIN)
  @Delete(':id/videos/:videoId')
  removeVideo(@Param('id') id: string, @Param('videoId') videoId: string, @CurrentUser() user: AuthUser) {
    return this.listings.removeVideo(id, videoId, user);
  }
}
