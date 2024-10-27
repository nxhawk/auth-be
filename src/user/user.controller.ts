import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { TokenData } from 'src/utils/types';

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
