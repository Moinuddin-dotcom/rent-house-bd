import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { AdminListingQueryDto, OwnerRequestQueryDto, UpdateListingStatusDto } from './dto/admin-query.dto';
import { ReviewOwnerDto } from './dto/review-owner.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('stats')
  stats() {
    return this.admin.stats();
  }

  @Get('owner-requests')
  listOwnerRequests(@Query() query: OwnerRequestQueryDto) {
    return this.admin.listOwnerRequests(query);
  }

  @Get('owner-requests/:id')
  getOwnerRequest(@Param('id') id: string) {
    return this.admin.getOwnerRequest(id);
  }

  @Patch('owner-requests/:id/review')
  review(@Param('id') id: string, @CurrentUser() user: AuthUser, @Body() dto: ReviewOwnerDto) {
    return this.admin.reviewOwnerRequest(id, user.id, dto);
  }

  @Get('listings')
  listListings(@Query() query: AdminListingQueryDto) {
    return this.admin.listListings(query);
  }

  @Patch('listings/:id/status')
  updateListingStatus(@Param('id') id: string, @Body() dto: UpdateListingStatusDto) {
    return this.admin.updateListingStatus(id, dto.status);
  }
}
