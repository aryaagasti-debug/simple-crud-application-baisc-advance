import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { CommonLocksModule } from '../common/locks/common-locks.module';
import { QueueModule } from '../queue/queue.module'; // 👈 QueueModule को आयात करें

@Module({
  imports: [
    CommonLocksModule,
    QueueModule, // 👈 इसे PaymentModule के imports array में जोड़ें
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
