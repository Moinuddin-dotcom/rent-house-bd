import { Module } from '@nestjs/common';
import { OwnersModule } from '../owners/owners.module';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';

@Module({
  imports: [OwnersModule],
  controllers: [ListingsController],
  providers: [ListingsService],
})
export class ListingsModule {}
