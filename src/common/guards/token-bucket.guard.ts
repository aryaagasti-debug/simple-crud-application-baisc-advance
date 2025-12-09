import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadGatewayException,
} from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { Request } from 'express';

@Injectable()
export class TokenBukcetGuard implements CanActivate {
  private readonly BUCKET_SIZE = 5;
  private readonly REFILL_RATE = 1; // tokens per second

  constructor(private redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const ip =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      req.header['x-forwarded-for']?.toString() ||
      req.socket.remoteAddress ||
      'unknown';

    const now = Date.now();

    const tokenKey = `bucket:${ip}:tokens`;
    const timeKey = `bucket:${ip}:last`;

    const pipeline = this.redis.client.pipeline();

    pipeline.get(tokenKey);
    pipeline.get(timeKey);

    const result = await pipeline.exec();

    const tokens = Number(result?.[0]?.[1] ?? this.BUCKET_SIZE);
    const lastRefill = Number(result?.[1]?.[1] ?? now);

    //calcuate refil
    const elapsed = Math.floor((now - lastRefill) / 1000);
    const refill = elapsed * this.REFILL_RATE;

    const newToken = Math.min(this.BUCKET_SIZE, tokens + refill);

    if (newToken < 1) {
      throw new BadGatewayException('Too many requests');
    }

    // consume 1 token
    const newValues = this.redis.client.pipeline();
    newValues.set(tokenKey, newToken - 1);
    newValues.set(timeKey, now);
    await newValues.exec();

    return true;
  }
}
