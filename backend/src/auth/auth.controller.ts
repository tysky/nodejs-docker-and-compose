import { Controller, Post, UseGuards, Body } from '@nestjs/common';

import { UsersService } from '@/users/users.service';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { LocalGuard } from '@/guards/local.guard';

import { AuthService } from './auth.service';
import { SigninUserDto } from '@/users/dto/signin-user.dto';

@Controller('/')
export class AuthController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @UseGuards(LocalGuard)
  @Post('signin')
  async signin(@Body() signinUserDto: SigninUserDto) {
    const user = await this.usersService.findOne({
      where: {
        username: signinUserDto.username,
      },
    });

    return this.authService.auth(user);
  }

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);

    return this.authService.auth(user);
  }
}
