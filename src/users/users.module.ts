import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';
import { AuthModule } from '../auth/auth.module'; // ✅ IMPORT
import { RedisModule } from '../redis/redis.module';
import { SlidingWindowGuard } from '../common/guards/sliding-window.guard';

@Module({
  imports: [CloudinaryModule, AuthModule, RedisModule],
  controllers: [UsersController],
  providers: [UsersService, PrismaService, SlidingWindowGuard],
})
export class UsersModule {}
