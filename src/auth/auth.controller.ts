import { Controller, Post, Body, Res, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import express from 'express';
import { JwtService } from '@nestjs/jwt';
import { AppLogger } from '../utils/logger';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { TokenBukcetGuard } from '../common/guards/token-bucket.guard';
// import { Throttle } from '@nestjs/throttler'; // Removed import as it's no longer needed

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private jwt: JwtService,
  ) {}

  // ✅ Rate limiting now applied by the global guard using AppModule's default (3 req / 60s)
  // @Throttle({ default: { limit: 3, ttl: 60 } }) // Removed
  @UseGuards(TokenBukcetGuard)
  @Post('login')
  @ApiOperation({ summary: 'User login using email & password' })
  @ApiBody({
    schema: {
      example: {
        email: 'admin@gmail.com',
        password: 'admin123',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    AppLogger.info('Login attempt', { email: dto.email });
    const { accessToken, refreshToken, user } = await this.auth.login(dto);

    AppLogger.info('Login success', { userId: user.id });

    res.cookie('access_token', accessToken, { httpOnly: true });
    res.cookie('refresh_token', refreshToken, { httpOnly: true });

    return { message: 'Logged in', user };
  }

  @Post('refresh')
  async refresh(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const token = req.cookies['refresh_token'];

    if (!token) throw new Error('No refresh token');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
    const payload = await this.jwt.verifyAsync(token, {
      secret: process.env.REFRESH_SECRET,
    });

    const newAccess = this.jwt.sign(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      { id: payload.id, email: payload.email, role: payload.role },
      { secret: process.env.ACCESS_SECRET, expiresIn: '15m' },
    );

    res.cookie('access_token', newAccess, { httpOnly: true });
    return { message: 'New access token created' };
  }
}
