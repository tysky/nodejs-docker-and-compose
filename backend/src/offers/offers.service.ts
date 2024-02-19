import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DataSource,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateOfferDto } from './dto/create-offer.dto';
import { Offer } from './entities/offer.entity';
import { UsersService } from '@/users/users.service';
import { WishesService } from '@/wishes/wishes.service';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    private usersService: UsersService,
    private wishesService: WishesService,
    private dataSource: DataSource,
  ) {}

  async create(createOfferDto: CreateOfferDto, userId: number): Promise<Offer> {
    const { itemId, amount } = createOfferDto;
    const user = await this.usersService.findOne({ where: { id: userId } });

    const wish = await this.wishesService.findOne({
      where: { id: itemId },
      relations: {
        owner: true,
      },
    });

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    if (wish.owner.id === userId) {
      throw new BadRequestException(
        'Нельзя вносить деньги на собственные подарки',
      );
    }

    const raised = wish.raised + amount;
    if (raised > wish.price) {
      throw new BadRequestException(
        'Сумма собранных средств не может превышать стоимость подарка',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.wishesService.updateOne({ id: itemId }, { raised });
      const updatedWish = await this.wishesService.findOne({
        where: { id: itemId },
        relations: {
          owner: true,
        },
      });

      const offer = await this.offerRepository.create({
        ...createOfferDto,
        user,
        item: updatedWish,
      });

      const savedOffer = await this.offerRepository.save(offer);

      await queryRunner.commitTransaction();

      return savedOffer;
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  findAll(query: FindManyOptions<Offer> = {}): Promise<Offer[]> {
    return this.offerRepository.find(query);
  }

  findOne(query: FindOneOptions<Offer>): Promise<Offer> {
    return this.offerRepository.findOne(query);
  }
}
