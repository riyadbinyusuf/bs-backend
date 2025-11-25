import { createClient } from 'redis';
import { env } from './env';
import { logger } from './logger';

const client = createClient({
  url: env.REDIS_URL
});

client.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

client.on('connect', () => {
  logger.success('Redis Client Connected');
});

await client.connect();

export default client;
