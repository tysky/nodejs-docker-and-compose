import { PickType } from '@nestjs/mapped-types';
import { Wish } from '../entities/wish.entity';

export class CreateWishDto extends PickType(Wish, [
  'name',
  'link',
  'image',
  'price',
  'description',
] as const) {}
