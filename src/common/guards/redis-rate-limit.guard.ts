// src/common/guards/redis-rate-limit.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { Request } from 'express';
import * as authRequest from '../../auth/types/auth-request'; // <-- Imported

@Injectable()
export class RedisRateLimitGuard implements CanActivate {
  constructor(private redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // ✅ CHANGE: Use the custom AuthRequest type
    const req = context.switchToHttp().getRequest<authRequest.AuthRequest>();

    // Using IP as fallback (for unauthenticated routes)
    const ip =
      req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress;

    // Use userId for authenticated requests, fallback to IP for unauthenticated
    const identifier = req.user?.id ? `user:${req.user.id}` : `ip:${ip}`;

    const key = `rate:${identifier}`; // ✅ Updated key structure for both
    const limit = 3;
    const window = 300;

    // ... rest of your logic
    const current = await this.redis.client.incr(key);

    if (current === 1) {
      await this.redis.client.expire(key, window);
    }

    if (current > limit) {
      throw new BadRequestException('Too many requests, slow down');
    }

    return true;
  }
}
