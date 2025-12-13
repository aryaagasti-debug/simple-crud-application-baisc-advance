import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '../redis/redis.module';
import { TokenBukcetGuard } from '../common/guards/token-bucket.guard';
import { SessionService } from './sessions/session.service';
@Module({
  imports: [
    RedisModule,
    JwtModule.register({
      secret: process.env.ACCESS_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, TokenBukcetGuard, SessionService],
  exports: [JwtModule, SessionService],
})
export class AuthModule {}
