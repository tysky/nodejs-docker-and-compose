import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  Repository,
  FindOneOptions,
  FindOptionsWhere,
  FindManyOptions,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { HashService } from '@/hash/hash.service';
import { Wish } from '@/wishes/entities/wish.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private hashService: HashService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password } = createUserDto;
    const existedUser = await this.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });

    if (existedUser) {
      throw new ConflictException(
        'Пользователь с таким email или username уже зарегистрирован',
      );
    }

    const hashedPassword = await this.hashService.hash(password);

    return this.userRepository.save({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOne(query: FindOneOptions<User>): Promise<User> {
    return this.userRepository.findOne(query);
  }

  async findByUsername(query: FindOneOptions<User>): Promise<User> {
    const user = await this.findOne(query);

    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    }

    return user;
  }

  async updateOne(query: FindOptionsWhere<User>, updateUserDto: UpdateUserDto) {
    let user = updateUserDto;

    if (updateUserDto.password) {
      const { password, ...userData } = updateUserDto;
      const hashedPassword = await this.hashService.hash(password);
      user = { ...userData, password: hashedPassword };
    }

    try {
      const updatedUser = await this.userRepository.update(query, user);
      return updatedUser;
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException(
          'Пользователь с таким email или username уже зарегистрирован',
        );
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  removeOne(query: FindOptionsWhere<User>) {
    return this.userRepository.delete(query);
  }

  findMany(query: FindManyOptions<User>) {
    return this.userRepository.find(query);
  }

  async findWishes(query: FindOptionsWhere<User>): Promise<Wish[]> {
    const user = await this.userRepository.findOne({
      where: query,
      relations: {
        wishes: true,
      },
    });
    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    }

    return user.wishes;
  }
}
