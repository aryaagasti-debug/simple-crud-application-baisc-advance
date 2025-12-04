import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostModule } from './post/post.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // ✅ FIX: Use 'throttlers' array, and set 'ttl' in milliseconds (60 seconds = 60000ms).
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // 60 seconds window
          limit: 3, // ONLY 3 requests allowed globally by default
        },
      ],
    }),

    PrismaModule,
    AuthModule,
    UsersModule,
    PostModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // ✅ GLOBAL GUARD (This correctly applies the rate limit to all routes)
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
