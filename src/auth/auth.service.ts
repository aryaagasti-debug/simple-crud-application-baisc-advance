import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { AppLogger } from '../utils/logger';
import { SessionService } from './sessions/session.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private sessionService: SessionService,
  ) {}

  async login(dto: LoginDto) {
    AppLogger.info('Validating user', { email: dto.email });

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      AppLogger.warn('Invalid login attempt - user not found', {
        email: dto.email,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) {
      AppLogger.warn('Invalid password attempt', { userId: user.id });
      throw new UnauthorizedException('Invalid credentials');
    }

    AppLogger.info('User authenticated', { userId: user.id });

    const payload = { id: user.id, email: user.email, role: user.role };

    const accessToken = this.jwt.sign(payload, {
      secret: process.env.ACCESS_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = this.jwt.sign(payload, {
      secret: process.env.REFRESH_SECRET,
      expiresIn: '7d',
    });

    await this.sessionService.saveSession(user.id, refreshToken);

    return { accessToken, refreshToken, user };
  }
}
