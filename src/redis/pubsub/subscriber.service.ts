import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisService } from '../redis.service';

// src/redis/pubsub/subscriber.service.ts

@Injectable()
export class SubscriberService implements OnModuleInit {
  constructor(private readonly redisService: RedisService) {}

  async onModuleInit() {
    const subscriber = this.redisService.client.duplicate();

    // 🛑 CRITICAL CHECK: ENSURE THIS LINE IS REMOVED
    // await subscriber.connect();

    // If the main client is connected, the duplicated client
    // should automatically start trying to connect or already be connected.

    // The subscription itself should be enough to maintain the connection.
    await subscriber.subscribe('notifications', (message) => {
      const messageString = message as unknown as string;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = JSON.parse(messageString);
      console.log('notification Received :', data); // <--- This is the line that generates your missing console output
    });
  }
}
