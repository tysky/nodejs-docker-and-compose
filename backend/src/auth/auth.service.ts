import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { User } from '@/users/entities/user.entity';
import { UsersService } from '@/users/users.service';
import { JwtPayload } from './types';
import { HashService } from '@/hash/hash.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private hashService: HashService,
  ) {}

  auth(user: User) {
    const payload: JwtPayload = { sub: user.id };

    return { access_token: this.jwtService.sign(payload) };
  }

  async validatePassword(username: string, password: string) {
    const user = await this.usersService.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException('Пользователь с таким логином не найден');
    }

    const isMatchedPassword = await this.hashService.compare(
      password,
      user.password,
    );

    if (isMatchedPassword) {
      const { password: _password, ...result } = user;

      return result;
    } else {
      throw new UnauthorizedException('Некорректная пара логин и пароль');
    }
  }
}
