// src/common/guards/sliding-window.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException, // Use ForbiddenException for rate limits
} from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
// import { Request } from 'express'; // ❌ Remove or keep for base type
import * as authRequest from '../../auth/types/auth-request'; // ✅ Import your custom type

@Injectable()
export class SlidingWindowGuard implements CanActivate {
  constructor(private redis: RedisService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    // ✅ Use the custom AuthRequest type
    const req = ctx.switchToHttp().getRequest<authRequest.AuthRequest>();

    if (req.url === '/health') {
      return true;
    }

    // 1. Determine the unique identifier (User ID > IP)
    const ip =
      req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress;
    const identifier = req.user?.id ? `user:${req.user.id}` : `ip:${ip}`;

    const key = `sliding:${identifier}`;
    const LIMIT = 5; // Max requests allowed
    const WINDOW = 60 * 1000; // Window size in milliseconds (e.g., 60 seconds)
    const now = Date.now();

    // 2. Redis Operations (Atomic)
    const pipeline = this.redis.client.pipeline();

    // a. Add the current request timestamp to the sorted set (score=time, member=time)
    //    ZADD key score member
    pipeline.zadd(key, now.toString(), now.toString());

    // b. Remove all timestamps older than the window start (i.e., less than now - WINDOW)
    //    ZREMRANGEBYSCORE key min max
    const windowStart = now - WINDOW;
    pipeline.zremrangebyscore(key, 0, windowStart.toString());

    // c. Get the current count of remaining requests (all requests in the current window)
    //    ZCARD key
    pipeline.zcard(key);

    // d. Set the expiration on the key to prevent stale keys from accumulating.
    //    Use PEXPIRE (ms) or EXPIRE (s). Since WINDOW is in ms, PEXPIRE is better.
    //    Note: The TTL is applied to the key itself, not to individual members.
    //    It ensures the key is cleaned up if the user stops making requests.
    pipeline.pexpire(key, WINDOW);

    // 3. Execute the pipeline
    // The results array contains [null, status], [null, status], [null, count], [null, status]
    const results = await pipeline.exec();

    // The count result is at index 2 of the pipeline results
    const countResult = results?.[2];
    const count = typeof countResult?.[1] === 'number' ? countResult[1] : 0;

    // 4. Enforce the limit
    if (count > LIMIT) {
      // ⚠️ Use ForbiddenException (403) or TooManyRequestsException (429) if available.
      // BadGatewayException (502) is not appropriate for rate limiting.
      throw new ForbiddenException(
        `Rate limit exceeded for ${identifier}. Try again in ${WINDOW / 1000} seconds.`,
      );
    }

    return true;
  }
}
