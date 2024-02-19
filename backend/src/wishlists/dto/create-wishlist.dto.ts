import { PickType } from '@nestjs/mapped-types';
import { ArrayNotEmpty } from 'class-validator';
import { Wishlist } from '../entities/wishlist.entity';

export class CreateWishlistDto extends PickType(Wishlist, [
  'name',
  'image',
] as const) {
  @ArrayNotEmpty({
    message: 'Список подарков не может быть пустым',
  })
  itemsId: number[];
}
