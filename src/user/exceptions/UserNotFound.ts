import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFound extends HttpException {
  constructor() {
    super('User not existing', HttpStatus.BAD_REQUEST);
  }
}
