import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Repository,
  FindOneOptions,
  FindOptionsWhere,
  In,
  FindManyOptions,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';
import { UsersService } from '@/users/users.service';
import { WishesService } from '@/wishes/wishes.service';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    private usersService: UsersService,
    private wishesService: WishesService,
  ) {}

  async create(
    createWishlistDto: CreateWishlistDto,
    ownerId: number,
  ): Promise<Wishlist> {
    const user = await this.usersService.findOne({ where: { id: ownerId } });
    const { itemsId, ...wishlistParams } = createWishlistDto;
    const wishes = await this.wishesService.findAll({
      where: { id: In(itemsId) },
    });

    if (!wishes) {
      throw new NotFoundException('Подарки не найдены');
    }

    const wishlist = await this.wishlistRepository.create({
      ...wishlistParams,
      owner: user,
      items: wishes,
    });

    return this.wishlistRepository.save(wishlist);
  }

  findAll(query: FindManyOptions<Wishlist> = {}): Promise<Wishlist[]> {
    return this.wishlistRepository.find(query);
  }

  async findOne(query: FindOneOptions<Wishlist>): Promise<Wishlist> {
    const wishlist = await this.wishlistRepository.findOne(query);

    if (!wishlist) {
      throw new BadRequestException('Вишлист не найден');
    }

    return wishlist;
  }

  async updateOne(
    query: FindOptionsWhere<Wishlist>,
    updateWishlistDto: UpdateWishlistDto,
  ) {
    const wishlist = await this.findOne({
      where: query,
      relations: {
        owner: true,
        items: true,
      },
    });
    if (!wishlist) {
      throw new NotFoundException('Вишлист не найден');
    }

    const { itemsId, ...wishlistParams } = updateWishlistDto;
    const updatedWishlistParams: Partial<Wishlist> = wishlistParams;

    if (itemsId) {
      const wishes = await this.wishesService.findAll({
        where: { id: In(itemsId) },
      });
      updatedWishlistParams.items = wishes;
    }

    return this.wishlistRepository.save({
      ...wishlist,
      ...updatedWishlistParams,
    });
  }

  removeOne(query: FindOptionsWhere<Wishlist>) {
    return this.wishlistRepository.delete(query);
  }

  isBelongToUser(wishlist: Wishlist, userId: number): boolean {
    return wishlist.owner.id === userId;
  }

  checkBelongToUser(wishlist: Wishlist, userId: number, exceptionText: string) {
    if (!this.isBelongToUser(wishlist, userId)) {
      throw new ForbiddenException(exceptionText);
    }
  }
}
