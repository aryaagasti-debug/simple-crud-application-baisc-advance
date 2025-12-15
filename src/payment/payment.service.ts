import { Injectable } from '@nestjs/common';
import { RedlockService } from '../common/locks/redlock.service';

@Injectable()
export class PaymentService {
  constructor(private readonly redlock: RedlockService) {}

  async pay(userId: number) {
    const lockKey = `lock:payment:${userId}`;
    let lockValue: string;

    // 🔒 ACQUIRE LOCK
    try {
      lockValue = await this.redlock.acquireLock(lockKey, 5000);
    } catch {
      throw new Error('❌ Payment already in progress');
    }

    try {
      console.log('💰 Payment started for user:', userId);

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
