import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisService } from '../redis.service';

type RedisStreamMessage = [string, string[]];
type RedisStreamEntry = [string, RedisStreamMessage[]];
type RedisStreamResult = RedisStreamEntry[] | null;

@Injectable()
export class StreamConsumerService implements OnModuleInit {
  private readonly STREAM = 'stream:notifications';
  private readonly GROUP = 'notification-group';
  private readonly CONSUMER = 'worker-1';

  constructor(private readonly redisService: RedisService) {}

  async onModuleInit() {
    await this.createGroup();
    void this.consume();
  }

  private async createGroup() {
    try {
      await this.redisService.client.xgroup(
        'CREATE',
        this.STREAM,
        this.GROUP,
        '0',
        'MKSTREAM',
      );
      console.log('✅ Consumer group created');
    } catch (error) {
      if ((error as Error).message.includes('BUSYGROUP')) {
        console.log('ℹ️ Consumer group already exists');
      } else {
        throw error;
      }
    }
  }

  private async consume() {
    console.log(
      `👂 Starting consumer ${this.CONSUMER} for stream ${this.STREAM}`,
    );
    while (true) {
      const res = (await this.redisService.client.xreadgroup(
        'GROUP',
        this.GROUP,
        this.CONSUMER,
        'COUNT',
        5,
        'BLOCK',
        5000,
        'STREAMS',
        this.STREAM,
        '>',
      )) as RedisStreamResult;

      if (!res) continue;

      for (const [, messages] of res) {
        for (const [id, fields] of messages) {
          const data = this.toObject(fields);
          console.log(`📥 [${id}] Stream Event:`, data);

          await this.redisService.client.xack(this.STREAM, this.GROUP, id);
          console.log(`   ✅ [${id}] Acknowledged`);
        }
      }
    }
  }

  private toObject(fields: string[]): Record<string, string> {
    const obj: Record<string, string> = {};
    for (let i = 0; i < fields.length; i += 2) {
      obj[fields[i]] = fields[i + 1];
    }
    return obj;
  }
}
