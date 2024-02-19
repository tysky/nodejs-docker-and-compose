import { PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class SigninUserDto extends PickType(CreateUserDto, [
  'username',
  'password',
] as const) {}
