import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisCacheService } from './cache.service';
import cacheConfig from '../config/cache.config';

@Module({
  imports: [
    ConfigModule.forFeature(cacheConfig),
  ],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule {}