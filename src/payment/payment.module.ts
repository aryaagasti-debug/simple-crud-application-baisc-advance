import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { CommonLocksModule } from '../common/locks/common-locks.module';

@Module({
  imports: [CommonLocksModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
