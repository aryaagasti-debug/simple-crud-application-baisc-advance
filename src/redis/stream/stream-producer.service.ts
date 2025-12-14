import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis.service';

@Injectable()
export class StreamProducerService {
  constructor(private readonly redisService: RedisService) {}

  async add(
    stream: string,
    data: Record<string, string>,
  ): Promise<string | null> {
    const messageId = await this.redisService.client.xadd(
      stream,
      '*',
      ...Object.entries(data).flat(),
    );

    return messageId;
  }
}
