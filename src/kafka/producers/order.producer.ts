import { kafka } from '../kafka.client';
import { OrderCreatedEvent } from '../types/order.event';

const producer = kafka.producer();

export async function emitOrderCreated(
  event: OrderCreatedEvent,
): Promise<void> {
  await producer.connect();

  await producer.send({
    topic: 'orders',
    messages: [
      {
        key: event.orderId.toString(),
        value: JSON.stringify(event),
      },
    ],
  });

  console.log('📤 Order event emitted:', event);
}
