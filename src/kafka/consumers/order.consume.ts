import { kafka } from '../kafka.client';
import { OrderCreatedEvent } from '../types/order.event';

export async function startOrderConsumer(): Promise<void> {
  const consumer = kafka.consumer({
    groupId: 'order-processing-group',
  });

  await consumer.connect();
  await consumer.subscribe({ topic: 'orders', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const order: OrderCreatedEvent = JSON.parse(message.value.toString());

      console.log('📥 Order consumed:', order);

      // 👉 here you do:
      // inventory update
      // invoice generation
      // payment reconciliation
    },
  });
}
