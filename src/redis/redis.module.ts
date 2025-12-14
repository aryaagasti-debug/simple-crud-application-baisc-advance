import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { PublisherService } from './pubsub/publisher.service';
import { SubscriberService } from './pubsub/subscriber.service';
import { StreamProducerService } from './stream/stream-producer.service';
import { StreamConsumerService } from './stream/stream-consumer.service';

@Module({
  providers: [
    RedisService,
    PublisherService,
    SubscriberService,
    StreamProducerService,
    StreamConsumerService,
  ],
  exports: [RedisService, PublisherService, StreamProducerService],
})
export class RedisModule {}
