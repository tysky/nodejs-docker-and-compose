import { IsInt, IsString, IsUrl, Length, Min } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  ManyToMany,
} from 'typeorm';

import { User } from '@/users/entities/user.entity';
import { Offer } from '@/offers/entities/offer.entity';
import { Wishlist } from '@/wishlists/entities/wishlist.entity';

@Entity()
export class Wish {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;

  @Column()
  @Length(1, 250, {
    message: 'Название подарка должно быть не менее 1 и не более 250 символов',
  })
  name: string;

  @Column()
  @IsString()
  link: string;

  @Column()
  @IsUrl(undefined, {
    message: 'Ссылка на изображение должна быть валидным URL',
  })
  image: string;

  @Column({ type: 'real' })
  @Min(1, {
    message: 'Цена подарка должна быть больше или равна 1 рублю',
  })
  price: number;

  @Column({ type: 'real', default: 0 })
  raised: number;

  @ManyToOne(() => User, (user) => user.wishes)
  owner: User;

  @Column()
  @Length(1, 1024, {
    message: 'Описание подарка должно быть не менее 1 и не более 1024 символов',
  })
  description: string;

  @OneToMany(() => Offer, (offer) => offer.id)
  offers: Offer[];

  @Column({ default: 0 })
  @IsInt()
  @Min(0)
  copied: number;

  @Column({ nullable: true })
  copiedFrom: number;

  @ManyToMany(() => Wishlist, (wishlist) => wishlist.items)
  wishlists: Wishlist[];
}
