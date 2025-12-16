import { kafka } from '../kafka.client';
import { PostCreatedEvent } from '../types/post.event';

const producer = kafka.producer();

export async function emitPostCreated(event: PostCreatedEvent): Promise<void> {
  await producer.connect();

  await producer.send({
    topic: 'posts',
    messages: [
      {
        key: event.postId.toString(),
        value: JSON.stringify(event),
      },
    ],
  });

  console.log('📤 Post event emitted:', event);
}
