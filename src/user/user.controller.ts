import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../common/guards/accessToken.guard';
import { Routes, Services } from '../utils/constants';
import { AuthUser } from '../utils/decorators';
import { TokenData } from '../utils/types';

@Controller(Routes.USER)
export class UserController {
  constructor(@Inject(Services.USERS) private readonly userService) {}

  @UseGuards(AccessTokenGuard)
  @Get('/me')
  findById(@AuthUser() token: TokenData) {
    const id = token.sub;
    return this.userService.findById(id);
  }
}
