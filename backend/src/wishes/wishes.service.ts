import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  Repository,
  FindOneOptions,
  FindOptionsWhere,
  FindManyOptions,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Wish } from './entities/wish.entity';
import { UsersService } from '@/users/users.service';

interface CreateWish extends CreateWishDto {
  copiedFrom?: number;
}

interface UpdateWish extends UpdateWishDto {
  copied?: number;
  raised?: number;
}

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
    private usersService: UsersService,
  ) {}

  async create(createWishDto: CreateWish, ownerId: number): Promise<Wish> {
    const user = await this.usersService.findOne({ where: { id: ownerId } });
    const wish = await this.wishRepository.create({
      ...createWishDto,
      owner: user,
    });

    return await this.wishRepository.save(wish);
  }

  findAll(options: FindManyOptions<Wish> = {}): Promise<Wish[]> {
    return this.wishRepository.find(options);
  }

  async findOne(query: FindOneOptions<Wish>): Promise<Wish> {
    const wish = await this.wishRepository.findOne(query);

    if (!wish) {
      throw new BadRequestException('Подарок не найден');
    }

    return wish;
  }

  updateOne(query: FindOptionsWhere<Wish>, updateWish: UpdateWish) {
    return this.wishRepository.update(query, updateWish);
  }

  removeOne(query: FindOptionsWhere<Wish>) {
    return this.wishRepository.delete(query);
  }

  async copy(wishId: number, userId: number) {
    const wish = await this.findOne({
      where: { id: wishId },
      relations: { owner: true },
    });

    if (wish.owner.id === userId) {
      throw new BadRequestException('Нельзя копировать свои подарки');
    }

    const userWishes = await this.usersService.findWishes({ id: userId });
    const alreadyCopied = userWishes.find((wish) => wish.copiedFrom === wishId);

    if (alreadyCopied) {
      throw new BadRequestException('Вы уже копировали этот подарок');
    }

    const copyWish = await this.create(
      {
        name: wish.name,
        link: wish.link,
        image: wish.image,
        price: wish.price,
        description: wish.description,
        copiedFrom: wish.id,
      },
      userId,
    );

    await this.updateOne({ id: wish.id }, { copied: wish.copied + 1 });
    return copyWish;
  }

  isBelongToUser(wish: Wish, userId: number): boolean {
    return wish.owner.id === userId;
  }

  checkBelongToUser(wish: Wish, userId: number, exceptionText: string) {
    if (!this.isBelongToUser(wish, userId)) {
      throw new ForbiddenException(exceptionText);
    }
  }

  async countRaised(wishId: number): Promise<number> {
    const wish = await this.findOne({
      where: { id: wishId },
      relations: { offers: true },
    });

    return wish.offers.reduce((acc, offer) => acc + offer.amount, 0);
  }

  checkUpdatingPriceAbility = (wish: Wish, price?: number) => {
    if (price && wish.raised > 0) {
      throw new BadRequestException(
        'Нельзя изменить цену подарка, если кто-то уже скинулся на него',
      );
    }
  };
}
