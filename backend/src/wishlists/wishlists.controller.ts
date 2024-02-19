import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { JwtGuard } from '@/guards/jwt.guard';
import { USER_SELECT_PROPERTIES } from '@/users/users.constants';

@Controller('wishlistlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(@Body() createWishlistDto: CreateWishlistDto, @Req() req) {
    return this.wishlistsService
      .create(createWishlistDto, req.user.id)
      .then((wishlist) => {
        const { password: _password, ...ownerFields } = wishlist.owner;

        return {
          ...wishlist,
          owner: ownerFields,
        };
      });
  }

  @UseGuards(JwtGuard)
  @Get()
  findAll() {
    return this.wishlistsService.findAll({
      relations: {
        owner: true,
        items: true,
      },
      select: {
        owner: USER_SELECT_PROPERTIES,
      },
    });
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wishlistsService.findOne({
      where: { id },
      relations: {
        owner: true,
        items: true,
      },
      select: {
        owner: USER_SELECT_PROPERTIES,
      },
    });
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWishlistDto: UpdateWishlistDto,
    @Req() req,
  ) {
    const wishlist = await this.wishlistsService.findOne({
      where: { id },
      relations: { owner: true },
    });

    this.wishlistsService.checkBelongToUser(
      wishlist,
      req.user.id,
      'Нельзя редактировать чужие вишлисты',
    );

    return this.wishlistsService
      .updateOne({ id }, updateWishlistDto)
      .then((wishlist) => {
        const { password: _password, ...ownerFields } = wishlist.owner;

        return {
          ...wishlist,
          owner: ownerFields,
        };
      });
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const wishlist = await this.wishlistsService.findOne({
      where: { id },
      relations: { owner: true },
    });

    this.wishlistsService.checkBelongToUser(
      wishlist,
      req.user.id,
      'Нельзя удалять чужие вишлисты',
    );

    await this.wishlistsService.removeOne({ id });

    return wishlist;
  }
}
