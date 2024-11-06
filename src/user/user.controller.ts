import {
  Controller,
  Get,
  Post,
  HttpStatus,
  Inject,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AccessTokenGuard } from '../common/guards/accessToken.guard';
import { Routes, Services } from '../utils/constants';
import { AuthUser } from '../utils/decorators';
import { TokenData } from '../utils/types';

@Controller(Routes.USER)
export class UserController {
  constructor(@Inject(Services.USERS) private readonly userService) {}

  @UseGuards(AccessTokenGuard)
  @Get('/profile')
  findById(@AuthUser() token: TokenData) {
    const id = token.sub;
    return this.userService.findById(id);
  }

  @UseGuards(AccessTokenGuard)
  @Post('/logout')
  async logout(@AuthUser() token: TokenData, @Res() res: Response) {
    try {
      const id = token.sub;
      await this.userService.logoutUser(id);
      return res
        .status(HttpStatus.OK)
        .json({ message: 'User logged out successfully' });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error logging out user' });
    }
  }
}
