import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UsersService } from '../users/users.service';
import { JwtPayload } from './types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('jwt_secret'),
    });
  }

  async validate(jwtPayload: JwtPayload) {
    const user = this.usersService.findOne({ where: { id: jwtPayload.sub } });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
