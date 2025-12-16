import { kafka } from '../kafka.client';
import { NotificationEvent } from '../types/notification.event';

export async function startNotificationConsumer(): Promise<void> {
  const consumer = kafka.consumer({
    groupId: 'notification-group',
  });

  await consumer.connect();
  await consumer.subscribe({
    topic: 'notifications',
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const event: NotificationEvent = JSON.parse(message.value.toString());

      console.log('🔔 Notification:', event);

      // 👉 Send email / push / SMS
    },
  });
}
