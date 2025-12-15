import { Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async pay() {
    const userId = 1; // In real scenarios, get this from auth context
    return this.paymentService.pay(userId);
  }
}
