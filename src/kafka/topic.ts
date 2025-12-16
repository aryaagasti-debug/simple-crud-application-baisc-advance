import { kafka } from './kafka.client';

export async function createKafkaTopic() {
  const admin = kafka.admin();
  await admin.connect();

  await admin.createTopics({
    topics: [
      { topic: 'orders', numPartitions: 3, replicationFactor: 1 },
      { topic: 'payments', numPartitions: 2, replicationFactor: 1 },
      { topic: 'notifications', numPartitions: 2, replicationFactor: 1 },
      { topic: 'orders.DLQ', numPartitions: 1, replicationFactor: 1 },
    ],
  });

  await admin.disconnect();
}
