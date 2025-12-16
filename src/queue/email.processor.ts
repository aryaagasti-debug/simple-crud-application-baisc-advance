// src/queue/email.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('email-queue')
export class EmailProcessor extends WorkerHost {
  async process(job: Job): Promise<void> {
    console.log('📧 Processing email job:', job.data);

    // Logic to handle different job types in the same queue
    if (job.name === 'send-transactional-email') {
      // Assuming job.data contains { to, subject, body }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.log(`Sending transactional email to: ${job.data.to}`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.log(`Subject: ${job.data.subject}`);
    } else if (job.name === 'send-welcome-email') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.log(`Sending welcome email to user ID: ${job.data.userId}`);
    }

    // simulate email sending
    await new Promise((res) => setTimeout(res, 1000));

    console.log('✅ Job processed successfully:', job.name);
  }
}
