import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';

import { JwtGuard } from '@/guards/jwt.guard';

import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { USER_SELECT_PROPERTIES } from '@/users/users.constants';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @UseGuards(JwtGuard)
  @Post()
  async create(@Body() createWishDto: CreateWishDto, @Req() req) {
    const { id } = req.user;
    return this.wishesService.create(createWishDto, id).then((wish) => {
      const { password: _password, ...ownerFields } = wish.owner;
      return {
        ...wish,
        owner: ownerFields,
      };
    });
  }

  @Get('last')
  findLast() {
    return this.wishesService.findAll({
      order: { createdAt: 'DESC' },
      take: 40,
      relations: {
        owner: true,
      },
      select: {
        owner: USER_SELECT_PROPERTIES,
      },
    });
  }

  @Get('top')
  findTop() {
    return this.wishesService.findAll({
      order: { copied: 'DESC' },
      take: 20,
      relations: {
        owner: true,
      },
      select: {
        owner: USER_SELECT_PROPERTIES,
      },
    });
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wishesService.findOne({
      where: { id },
      relations: {
        owner: true,
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
    @Body() updateWishDto: UpdateWishDto,
    @Req() req,
  ) {
    const wish = await this.wishesService.findOne({
      where: { id },
      relations: { owner: true },
    });

    this.wishesService.checkBelongToUser(
      wish,
      req.user.id,
      'Нельзя редактировать чужие подарки',
    );

    this.wishesService.checkUpdatingPriceAbility(wish, updateWishDto.price);

    await this.wishesService.updateOne({ id }, updateWishDto);

    return this.wishesService.findOne({ where: { id } });
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const wish = await this.wishesService.findOne({
      where: { id },
      relations: { owner: true },
    });

    this.wishesService.checkBelongToUser(
      wish,
      req.user.id,
      'Нельзя удалять чужие подарки',
    );

    await this.wishesService.removeOne({ id });

    return wish;
  }

  @UseGuards(JwtGuard)
  @Post(':id/copy')
  async copy(@Param('id', ParseIntPipe) wishId: number, @Req() req) {
    const wish = await this.wishesService.copy(wishId, req.user.id);
    const { password: _password, ...ownerFields } = wish.owner;

    return { ...wish, owner: ownerFields };
  }
}
