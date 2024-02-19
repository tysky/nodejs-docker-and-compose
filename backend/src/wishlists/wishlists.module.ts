import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WishlistsService } from './wishlists.service';
import { WishlistsController } from './wishlists.controller';
import { Wishlist } from './entities/wishlist.entity';
import { UsersModule } from '@/users/users.module';
import { WishesModule } from '@/wishes/wishes.module';

@Module({
  imports: [TypeOrmModule.forFeature([Wishlist]), UsersModule, WishesModule],
  controllers: [WishlistsController],
  providers: [WishlistsService],
  exports: [WishlistsService],
})
export class WishlistsModule {}
