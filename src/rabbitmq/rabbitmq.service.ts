import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Connection, Channel } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: Connection;
  private channel: Channel;
  private readonly maxRetries = 5;
  private readonly retryDelay = 5000; // 5 seconds

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const exchange = this.configService.get<string>('rabbitmq.exchange');
    if (!exchange) {
      throw new Error('RabbitMQ exchange not configured');
    }

    await this.connect();
    await this.setupExchange(exchange);
  }

  async onModuleDestroy() {
    await this.closeConnections();
  }

  async publish(routingKey: string, message: any): Promise<void> {
    try {
      const exchange = this.configService.get<string>('rabbitmq.exchange');
      if (!this.channel) {
        await this.connect();
      }

      await this.channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(message)),
        { persistent: true },
      );

      this.logger.log(
        `Message published to exchange ${exchange} with routing key ${routingKey}`,
      );
    } catch (error) {
      this.logger.error('Error publishing message:', error);
      throw error;
    }
  }

  async subscribe(
    routingKey: string,
    callback: (message: any) => Promise<void>,
  ): Promise<void> {
    try {
      const exchange = this.configService.get<string>('rabbitmq.exchange');
      const queueName = this.configService.get<string>('rabbitmq.queue');

      if (!this.channel) {
        await this.connect();
      }

      // Assert queue
      const queue = await this.channel.assertQueue(queueName, {
        durable: true,
      });

      // Bind queue to exchange with routing key
      await this.channel.bindQueue(queue.queue, exchange, routingKey);

      // Start consuming messages
      await this.channel.consume(queue.queue, async (msg) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            await callback(content);
            this.channel.ack(msg);
          } catch (error) {
            this.logger.error(
              `Error processing message from queue ${queue.queue}:`,
              error,
            );
            // Requeue the message if processing fails
            this.channel.nack(msg, false, true);
          }
        }
      });

      this.logger.log(
        `Subscribed to queue ${queue.queue} with routing key ${routingKey}`,
      );
    } catch (error) {
      this.logger.error('Error setting up subscription:', error);
      throw error;
    }
  }

  private async connect(retries = this.maxRetries): Promise<void> {
    try {
      const url = this.configService.get<string>('rabbitmq.url');
      if (!url) {
        throw new Error('RabbitMQ URL not configured');
      }

      this.logger.log(`Attempting to connect to RabbitMQ at ${url}`);
      this.connection = await connect(url);
      this.channel = await this.connection.createChannel();

      // Setup connection event handlers
      this.connection.on('error', (err) => {
        this.logger.error('RabbitMQ connection error:', err);
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed');
      });

      this.logger.log('Successfully connected to RabbitMQ');
    } catch (error) {
      if (retries > 0) {
        const delay = this.retryDelay;
        this.logger.warn(
          `Failed to connect to RabbitMQ, ${retries} retries left. Retrying in ${delay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.connect(retries - 1);
      }
      this.logger.error(
        'Failed to connect to RabbitMQ after multiple attempts:',
        error,
      );
      throw error;
    }
  }

  private async setupExchange(exchange: string): Promise<void> {
    if (this.channel) {
      await this.channel.assertExchange(exchange, 'topic', { durable: true });
    }
  }

  private async closeConnections(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connections:', error);
    }
  }
}
