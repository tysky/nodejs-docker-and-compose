import { Length, IsUrl, IsEmail, IsString, MinLength } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';

import { Wish } from '@/wishes/entities/wish.entity';
import { Offer } from '@/offers/entities/offer.entity';
import { Wishlist } from '@/wishlists/entities/wishlist.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;

  @Column()
  @Length(2, 30, {
    message: 'Имя пользователя должно быть не менее 2 и не более 30 символов',
  })
  username: string;

  @Column({
    default: 'Пока ничего не рассказал о себе',
  })
  @Length(2, 200, {
    message: 'Текст о себе должен быть не менее 2 и не более 200 символов',
  })
  about: string;

  @Column({
    default: 'https://i.pravatar.cc/300',
  })
  @IsUrl()
  avatar: string;

  @Column({
    unique: true,
  })
  @IsEmail()
  email: string;

  @Column()
  @IsString()
  @MinLength(2, {
    message: 'Пароль должен быть не менее 2 символов',
  })
  password: string;

  @OneToMany(() => Wish, (wish) => wish.owner)
  wishes: Wish[];

  @OneToMany(() => Offer, (offer) => offer.user)
  offers: Offer[];

  @ManyToOne(() => Wishlist, (wish) => wish.id)
  wishlists: Wishlist[];
}
