import { registerAs } from '@nestjs/config';

export default registerAs('rabbitmq', () => ({
  url: process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672',
  exchange: process.env.RABBITMQ_EXCHANGE || 'user_events',
  queue: process.env.RABBITMQ_QUEUE || 'user_queue',
}));
