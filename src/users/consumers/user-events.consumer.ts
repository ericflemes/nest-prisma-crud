import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '../../rabbitmq/rabbitmq.service';

@Injectable()
export class UserEventsConsumer implements OnModuleInit {
  private readonly logger = new Logger(UserEventsConsumer.name);

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async onModuleInit() {
    // Subscribe to user events
    await this.subscribeToUserEvents();
  }

  private async subscribeToUserEvents(): Promise<void> {
    // Subscribe to user.created events
    await this.rabbitMQService.subscribe('user.created', async (message) => {
      this.logger.log(`Processing user.created event: ${JSON.stringify(message)}`);
      // Aqui você pode adicionar lógica adicional para processar o evento
      // Por exemplo: enviar email, notificação, etc.
    });

    // Subscribe to user.updated events
    await this.rabbitMQService.subscribe('user.updated', async (message) => {
      this.logger.log(`Processing user.updated event: ${JSON.stringify(message)}`);
      // Adicione lógica de processamento aqui
    });

    // Subscribe to user.deleted events
    await this.rabbitMQService.subscribe('user.deleted', async (message) => {
      this.logger.log(`Processing user.deleted event: ${JSON.stringify(message)}`);
      // Adicione lógica de processamento aqui
    });
  }
}
