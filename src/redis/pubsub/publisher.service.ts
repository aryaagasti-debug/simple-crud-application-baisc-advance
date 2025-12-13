import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis.service';

@Injectable()
export class PublisherService {
  constructor(private readonly redisService: RedisService) {}

  async publish(channel: string, message: any): Promise<void> {
    await this.redisService.client.publish(channel, JSON.stringify(message));
  }
}
