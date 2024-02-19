import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtGuard } from '@/guards/jwt.guard';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUsersDto } from './dto/find-users.dto';
import { USER_SELECT_PROPERTIES } from './users.constants';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtGuard)
  @Get('me')
  findMe(@Req() req) {
    const { id } = req.user;
    return this.usersService.findOne({
      where: { id },
      select: USER_SELECT_PROPERTIES,
    });
  }

  @UseGuards(JwtGuard)
  @Get('me/wishes')
  findMyWishes(@Req() req) {
    const { id } = req.user;
    return this.usersService.findWishes({ id });
  }

  @UseGuards(JwtGuard)
  @Get(':username')
  async findByUsername(@Param('username') username: string) {
    return this.usersService.findByUsername({
      where: { username },
      select: USER_SELECT_PROPERTIES,
    });
  }

  @UseGuards(JwtGuard)
  @Get(':username/wishes')
  findWishes(@Param('username') username: string) {
    return this.usersService.findWishes({ username });
  }

  @UseGuards(JwtGuard)
  @Patch('me')
  async update(@Body() updateUserDto: UpdateUserDto, @Req() req) {
    const { id } = req.user;

    await this.usersService.updateOne({ id }, updateUserDto);

    return this.usersService.findOne({
      where: { id },
      select: USER_SELECT_PROPERTIES,
    });
  }

  @UseGuards(JwtGuard)
  @Post('find')
  findMany(@Body() findUsersDto: FindUsersDto) {
    const { query } = findUsersDto;
    return this.usersService.findMany({
      where: [{ email: query }, { username: query }],
      select: USER_SELECT_PROPERTIES,
    });
  }
}
