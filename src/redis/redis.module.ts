import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { PublisherService } from './pubsub/publisher.service';
import { SubscriberService } from './pubsub/subscriber.service';

@Module({
  providers: [RedisService, PublisherService, SubscriberService],
  exports: [RedisService, PublisherService],
})
export class RedisModule {}
