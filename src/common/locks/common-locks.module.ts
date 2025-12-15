import { Module } from '@nestjs/common';
import { RedlockService } from './redlock.service';
import { RedisModule } from '../../redis/redis.module';

@Module({
  imports: [RedisModule], // RedlockService needs components from RedisModule
  providers: [RedlockService],
  exports: [RedlockService], // EXPORT it so other modules can use it!
})
export class CommonLocksModule {}
