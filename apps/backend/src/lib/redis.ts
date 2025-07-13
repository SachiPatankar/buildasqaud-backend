import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;
const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT
  ? parseInt(process.env.REDIS_PORT, 10)
  : 6379;
const redisPassword = process.env.REDIS_PASSWORD;

// Prefer REDIS_URL if provided, else use host/port/password
const redis = redisUrl
  ? new Redis(redisUrl)
  : new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
    });

redis.on('connect', () => {
  console.log('Redis client connected');
});
redis.on('error', (err) => {
  console.error('Redis error:', err);
});

export default redis;
