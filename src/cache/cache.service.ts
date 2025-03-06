import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly logger = new Logger(RedisCacheService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get<string>('cache.url');
    if (!redisUrl) {
      throw new Error('Redis URL is not configured');
    }
    this.logger.log(`Connecting to Redis at ${redisUrl}`);
    
    this.client = new Redis(redisUrl);

    // Test connection
    try {
      await this.client.ping();
      this.logger.log('Successfully connected to Redis');
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    this.logger.log('Closing Redis connection');
    await this.client.quit();
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) return null;
      this.logger.debug(`Cache hit for key: ${key}`);
      return JSON.parse(value);
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, serializedValue);
        this.logger.debug(`Cache set for key: ${key} with TTL: ${ttl}`);
      } else {
        await this.client.set(key, serializedValue);
        this.logger.debug(`Cache set for key: ${key}`);
      }
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error);
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      this.logger.error(`Error getting keys with pattern ${pattern}:`, error);
      return [];
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
      this.logger.debug(`Cache deleted for key: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}:`, error);
    }
  }

  async delByPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.keys(pattern);
      if (keys.length > 0) {
        await Promise.all(keys.map(key => this.del(key)));
      }
    } catch (error) {
      this.logger.error(`Error deleting cache keys with pattern ${pattern}:`, error);
    }
  }

  async reset(): Promise<void> {
    try {
      await this.client.flushall();
      this.logger.log('Cache reset completed');
    } catch (error) {
      this.logger.error('Error resetting cache:', error);
    }
  }
}
