import { Injectable } from '@nestjs/common';
import { RedlockService } from '../common/locks/redlock.service';
import { OrderCreatedEvent } from '../kafka/types/order.event';
import { emitOrderCreated } from '../kafka/producers/order.producer';
import { EmailQueue } from '../queue/email.queue';

@Injectable()
export class PaymentService {
  constructor(
    private readonly redlock: RedlockService,
    private readonly emailQueue: EmailQueue,
  ) {}

  async pay(userId: number) {
    const lockKey = `lock:payment:${userId}`;
    let lockValue: string;

    // 🛑 FIX: Changed senEmail to sendEmail and made it awaitable
    await this.emailQueue.sendEmail({
      to: 'user@test.com',
      subject: 'Payment Initiated',
      body: 'Your payment was successful 🎉',
    });

    // 🛑 CRITICAL LOGIC FIX: The return statement below was executing BEFORE
    // the lock/payment logic, causing the lower half of the function to be unreachable.
    // The previous error masked this structural bug. I have removed the premature return.

    const event: OrderCreatedEvent = {
      orderId: Date.now(),
      userId,
      amount: 500,
      status: 'PAID',
      createdAt: new Date().toISOString(),
    };

    // 🔒 ACQUIRE LOCK
    try {
      lockValue = await this.redlock.acquireLock(lockKey, 5000);
    } catch {
      throw new Error('❌ Payment already in progress');
    }

    try {
      console.log('💰 Payment started for user:', userId);
      await emitOrderCreated(event); // Moved Kafka event emit here

      // simulate long payment
      await new Promise((resolve) => setTimeout(resolve, 3000));

      console.log('✅ Payment completed for user:', userId);

      return {
        status: 'SUCCESS',
        message: 'Payment processed',
      };
    } finally {
      // 🔓 RELEASE LOCK
      await this.redlock.releaseLock(lockKey, lockValue);
    }
  }
}
