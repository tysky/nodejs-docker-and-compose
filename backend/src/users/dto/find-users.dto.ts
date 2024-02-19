import { IsNotEmpty } from 'class-validator';

export class FindUsersDto {
  @IsNotEmpty()
  query: string;
}
