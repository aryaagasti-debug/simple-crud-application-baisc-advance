import { Injectable } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class SessionService {
  private PREFIX = 'session:';

  constructor(private readonly redisService: RedisService) {}

  async saveSession(
    userId: number,
    token: string,
    ttl = 7 * 24 * 60 * 60,
  ): Promise<void> {
    const key = `${this.PREFIX}${userId}:${token}`;
    await this.redisService.client.set(key, '1', 'EX', ttl);
  }
  async isValidateSession(userId: number, token: string): Promise<boolean> {
    const key = `${this.PREFIX}${userId}:${token}`;
    const exists = await this.redisService.client.exists(key);
    return Boolean(exists);
  }

  async deleteSession(userId: number, token: string): Promise<void> {
    const key = `${this.PREFIX}${userId}:${token}`;
    await this.redisService.client.del(key);
  }

  async deleteAllSessionsForUser(userId: number): Promise<void> {
    const pattern = `${this.PREFIX}${userId}:*`;
    const keys = await this.redisService.client.keys(pattern);
    if (keys.length) await this.redisService.client.del(...keys);
  }
}
