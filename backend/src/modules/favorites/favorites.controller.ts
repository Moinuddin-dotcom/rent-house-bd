import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { FavoritesService } from './favorites.service';

@ApiTags('favorites')
@ApiBearerAuth()
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favorites: FavoritesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.favorites.list(user.id);
  }

  @Get('ids')
  ids(@CurrentUser() user: AuthUser) {
    return this.favorites.ids(user.id);
  }

  @Post(':listingId')
  add(@CurrentUser() user: AuthUser, @Param('listingId') listingId: string) {
    return this.favorites.add(user.id, listingId);
  }

  @Delete(':listingId')
  remove(@CurrentUser() user: AuthUser, @Param('listingId') listingId: string) {
    return this.favorites.remove(user.id, listingId);
  }
}
