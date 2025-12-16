import { kafka } from '../kafka.client';

const producer = kafka.producer();

export async function sendToDLQ(
  originalTopic: string,
  payload: unknown,
  error: unknown,
): Promise<void> {
  await producer.connect();

  await producer.send({
    topic: `${originalTopic}.DLQ`,
    messages: [
      {
        value: JSON.stringify({
          failedAt: new Date().toISOString(),
          originalTopic,
          payload,
          error: error instanceof Error ? error.message : JSON.stringify(error),
        }),
      },
    ],
  });

  console.log('☠️ Message sent to DLQ:', originalTopic);
}
