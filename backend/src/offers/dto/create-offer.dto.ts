import { PickType } from '@nestjs/mapped-types';
import { IsNumber, IsPositive } from 'class-validator';
import { Offer } from '../entities/offer.entity';

export class CreateOfferDto extends PickType(Offer, [
  'amount',
  'hidden',
] as const) {
  @IsNumber()
  @IsPositive()
  itemId: number;
}
