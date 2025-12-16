export interface NotificationEvent {
  type: 'NEW_POST' | 'PAYMENT_SUCCESS';
  userId: number;
  message: string;
  time: string;
}
