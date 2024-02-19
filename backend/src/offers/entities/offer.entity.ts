import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '@/users/entities/user.entity';
import { Wish } from '@/wishes/entities/wish.entity';
import { IsBoolean, IsOptional, Min } from 'class-validator';

@Entity()
export class Offer {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.offers)
  user: User;

  @ManyToOne(() => Wish, (wish) => wish.offers, { onDelete: 'CASCADE' })
  item: Wish;

  @Column({ type: 'real' })
  @Min(1, {
    message: 'Сумма заявки должна быть больше или равна 1 рублю',
  })
  amount: number;

  @Column({ default: false })
  @IsOptional()
  @IsBoolean({
    message: 'Поле hidden должно быть типа boolean',
  })
  hidden: boolean;
}
