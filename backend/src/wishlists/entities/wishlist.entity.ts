import { IsUrl, Length, MaxLength } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Wish } from '@/wishes/entities/wish.entity';
import { User } from '@/users/entities/user.entity';

@Entity()
export class Wishlist {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;

  @Column()
  @Length(1, 250, {
    message: 'Название вишлиста должно быть не менее 1 и не более 250 символов',
  })
  name: string;

  @Column({ nullable: true })
  @MaxLength(1500, {
    message: 'Описание вишлиста должно быть не более 1500 символов',
  })
  description: string;

  @Column()
  @IsUrl(undefined, {
    message: 'Ссылка на изображение должна быть валидным URL',
  })
  image: string;

  @ManyToMany(() => Wish, (wish) => wish.wishlists)
  @JoinTable()
  items: Wish[];

  @ManyToOne(() => User, (user) => user.wishlists)
  owner: User;
}
