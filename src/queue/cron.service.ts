import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class CronService implements OnModuleInit {
  constructor(
    @InjectQueue('email-queue')
    private readonly emailQueue: Queue,
  ) {}

  async onModuleInit() {
    // ⏰ EVERY DAY AT 9 AM
    await this.emailQueue.add(
      'daily-report-email',
      { report: 'daily' },
      {
        repeat: {
          pattern: '0 9 * * *', // 9 AM daily
        },
      },
    );

    console.log('⏰ Daily email cron scheduled');
  }
}
