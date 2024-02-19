import bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

const SALT_ROUNDS = 10;

@Injectable()
export class HashService {
  hash(data: string) {
    return bcrypt.hash(data, SALT_ROUNDS);
  }

  compare(data: string, encrypted: string) {
    return bcrypt.compare(data, encrypted);
  }
}
