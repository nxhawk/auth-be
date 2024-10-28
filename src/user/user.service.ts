import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDetails } from '../utils/types';
import { UserAlreadyExists } from './exceptions/UserAlreadyExists';
import * as argon2 from 'argon2';
import { AuthDto } from '../auth/dtos/auth-dto';
import { UserNotFound } from './exceptions/UserNotFound';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async createUser(userDetails: CreateUserDetails) {
    const existingUser = await this.userModel.findOne({
      email: userDetails.email,
    });

    if (existingUser) throw new UserAlreadyExists();
    const hash = await argon2.hash(userDetails.password);

    try {
      const newUser = await this.userModel.create({
        ...userDetails,
        password: hash,
      });
      return newUser.save();
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async signIn(authDto: AuthDto) {
    const user = await this.userModel.findOne({
      email: authDto.email,
    });
    if (!user) throw new UserNotFound();
    const passwordMatches = await argon2.verify(
      user.password,
      authDto.password,
    );
    if (!passwordMatches)
      throw new BadRequestException('Password is incorrect');

    const tokens = await this.getTokens(
      user._id.toString(),
      user.email,
      user.name,
    );
    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);
    return tokens;
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.userModel.findByIdAndUpdate(
      userId,
      {
        refreshToken: hashedRefreshToken,
      },
      { new: true },
    );
  }

  async getTokens(userId: string, email: string, name: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          name,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          name,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.findById(userId);
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');
    const refreshTokenMatches = await argon2.verify(
      user.refreshToken,
      refreshToken,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
    const tokens = await this.getTokens(
      user._id.toString(),
      user.email,
      user.name,
    );
    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);
    return tokens;
  }

  async findById(id: string) {
    return this.userModel.findById(id);
  }
}
