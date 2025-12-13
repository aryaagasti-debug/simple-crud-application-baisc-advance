import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';
import { JwtService } from '@nestjs/jwt';
import { RedisModule } from '../redis/redis.module';
@Module({
  imports: [PrismaModule, CloudinaryModule, RedisModule],
  controllers: [PostController],
  providers: [PostService, JwtService],
})
export class PostModule {}
