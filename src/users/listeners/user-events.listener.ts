import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RabbitMQService } from '../../rabbitmq/rabbitmq.service';
import { User } from '@prisma/client';

@Injectable()
export class UserEventsListener {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  @OnEvent('user.created')
  async handleUserCreatedEvent(user: User) {
    await this.rabbitMQService.publish('user.created', {
      event: 'user.created',
      data: user,
      timestamp: new Date().toISOString(),
    });
  }

  @OnEvent('user.updated')
  async handleUserUpdatedEvent(user: User) {
    await this.rabbitMQService.publish('user.updated', {
      event: 'user.updated',
      data: user,
      timestamp: new Date().toISOString(),
    });
  }

  @OnEvent('user.deleted')
  async handleUserDeletedEvent(user: User) {
    await this.rabbitMQService.publish('user.deleted', {
      event: 'user.deleted',
      data: user,
      timestamp: new Date().toISOString(),
    });
  }
}
