export interface OrderCreatedEvent {
  orderId: number;
  userId: number;
  amount: number;
  status: 'PAID' | 'FAILED';
  createdAt: string;
}
