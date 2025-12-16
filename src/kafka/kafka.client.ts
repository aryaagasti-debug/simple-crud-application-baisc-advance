import { Kafka } from 'kafkajs';

export const kafka = new Kafka({
  clientId: 'simple-crud-app',
  brokers: ['localhost:9092'],
});
