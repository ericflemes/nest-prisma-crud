import { registerAs } from '@nestjs/config';

export default registerAs('cache', () => ({
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  ttl: parseInt(process.env.CACHE_TTL || '3600', 10), // Default 1 hour
  url: process.env.REDIS_URL || 'redis://redis:6379',
}));
