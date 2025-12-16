import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class EmailQueue {
  constructor(
    @InjectQueue('email-queue')
    private readonly emailQueue: Queue,
  ) {}

  // 1. FIX TYPO: Renamed from senEmail to sendEmail
  // 2. IMPLEMENTATION: Add job to BullMQ queue
  async sendEmail(emailData: { to: string; subject: string; body: string }) {
    // BullMQ Job Name: 'send-transactional-email'
    await this.emailQueue.add(
      'send-transactional-email',
      emailData, // The job data
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );
  }

  async sendWelcomeEmail(userId: number) {
    await this.emailQueue.add(
      'send-welcome-email', // Changed job name for clarity
      { userId },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );
  }
}
