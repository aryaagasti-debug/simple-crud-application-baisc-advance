import { Injectable } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { randomUUID } from 'crypto';

@Injectable()
export class RedlockService {
  constructor(private readonly redisService: RedisService) {}

  async acquireLock(key: string, ttl: number): Promise<string> {
    const lockValue = randomUUID();

    const expirySeconds = Math.ceil(ttl / 1000);

    const result = await this.redisService.client.set(
      key,
      lockValue,
      'EX',
      expirySeconds,
      'NX',
    );

    if (result !== 'OK') {
      throw new Error('Could not acquire lock');
    }
    return lockValue;
  }

  async releaseLock(key: string, lockValue: string): Promise<void> {
    const luascript = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
        else
            return 0
        end
    `;

    await this.redisService.client.eval(luascript, 1, key, lockValue);
  }
}
