import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { Routes, Services } from 'src/utils/constants';
import { CreateAuthDto } from './dtos/create-auth.dto';
import { AuthDto } from './dtos/auth-dto';
import { RefreshTokenGuard } from 'src/common/guards/refreshToken.guard';
import { AuthUser } from 'src/utils/decorators';
import { TokenData } from 'src/utils/types';

@Controller(Routes.AUTH)
export class AuthController {
  constructor(@Inject(Services.USERS) private readonly userService) {}

  @Post('/register')
  async register(@Body() createAuthDto: CreateAuthDto) {
    return await this.userService.createUser(createAuthDto);
  }

  @Post('/login')
  async login(@Body() authDto: AuthDto) {
    return await this.userService.signIn(authDto);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('/refresh')
  refreshTokens(@AuthUser() token: TokenData) {
    const userId = token.sub;
    const refreshToken = token?.refreshToken || '';
    return this.userService.refreshTokens(userId, refreshToken);
  }
}
