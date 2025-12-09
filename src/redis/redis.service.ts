import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  public client: Redis;

  onModuleInit() {
    this.client = new Redis({
      host: '127.0.0.1',
      port: 6379,
    });

    this.client.on('connect', () => {
      console.log('✅ Redis Connected Successfully');
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis Error', err);
    });
  }

  getClient() {
    return this.client;
  }
}
