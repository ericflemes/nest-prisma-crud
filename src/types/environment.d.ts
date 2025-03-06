declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      RABBITMQ_URL: string;
      NODE_ENV: 'development' | 'production' | 'test';

      // Database
      DB_HOST: string;
      DB_PORT: string;
      DB_USERNAME: string;
      DB_PASSWORD: string;
      DB_DATABASE: string;

      // RabbitMQ
      RABBITMQ_EXCHANGE: string;
      RABBITMQ_QUEUE: string;

      // Redis
      REDIS_HOST: string;
      REDIS_PORT: string;
      REDIS_URL: string;
      CACHE_TTL: string;
    }
  }
}

export {}; 