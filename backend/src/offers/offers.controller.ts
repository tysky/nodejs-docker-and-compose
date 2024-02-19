import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { JwtGuard } from '@/guards/jwt.guard';
import { USER_SELECT_PROPERTIES } from '@/users/users.constants';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @UseGuards(JwtGuard)
  @Post()
  async create(@Body() createOfferDto: CreateOfferDto, @Req() req) {
    const { id: userId } = req.user;

    return this.offersService.create(createOfferDto, userId).then((offer) => {
      const { password: _userPassword, ...userFields } = offer.user;
      const { password: _ownerPassword, ...ownerFields } = offer.item.owner;

      return {
        ...offer,
        user: userFields,
        item: {
          ...offer.item,
          owner: ownerFields,
        },
      };
    });
  }

  @UseGuards(JwtGuard)
  @Get()
  findAll() {
    return this.offersService.findAll({
      relations: { user: true, item: true },
      select: {
        user: USER_SELECT_PROPERTIES,
      },
    });
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.offersService.findOne({
      where: { id },
      relations: { user: true, item: true },
      select: {
        user: USER_SELECT_PROPERTIES,
      },
    });
  }
}
