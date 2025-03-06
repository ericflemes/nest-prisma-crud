import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisCacheModule } from '../cache/cache.module';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserEventsListener } from './listeners/user-events.listener';
import { UserEventsConsumer } from './consumers/user-events.consumer';

@Module({
  imports: [
    PrismaModule,
    RedisCacheModule,
    RabbitMQModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserEventsListener,
    UserEventsConsumer,
  ],
})
export class UsersModule {}
