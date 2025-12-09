import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { RedisService } from './redis/redis.service';
import express from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly redis: RedisService,
  ) {}

  @Get('csrf-token')
  getCsrf(@Req() req: express.Request) {
    if (!req.csrfToken) {
      return { csrfToken: null };
    }

    return { csrfToken: req.csrfToken() };
  }

  @Get('redis-test')
  async testRedis() {
    const client = this.redis.getClient();

    await client.set('nestjs', 'work');
    const value = await client.get('nestjs');

    return {
      message: 'Redis Connected',
      value,
    };
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
