import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;
const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT
  ? parseInt(process.env.REDIS_PORT, 10)
  : 6379;
const redisPassword = process.env.REDIS_PASSWORD;

// Create Redis client
let redis: Redis | null = null;
let isRedisAvailable = false;

// Initialize Redis connection
function initializeRedis(): Redis {
  if (redis) return redis;

  try {
    redis = redisUrl
      ? new Redis(redisUrl, {
          lazyConnect: true,
          enableOfflineQueue: false,
          connectTimeout: 5000,
        })
      : new Redis({
          host: redisHost,
          port: redisPort,
          password: redisPassword,
          lazyConnect: true,
          enableOfflineQueue: false,
          connectTimeout: 5000,
        });

    // Connection event handlers
    redis.on('connect', () => {
      console.log('✅ Redis client connected');
      isRedisAvailable = true;
    });

    redis.on('ready', () => {
      console.log('✅ Redis client ready');
      isRedisAvailable = true;
    });

    redis.on('error', (err) => {
      console.error('❌ Redis error:', err.message);
      isRedisAvailable = false;
    });

    redis.on('close', () => {
      console.log('🔌 Redis connection closed');
      isRedisAvailable = false;
    });

    redis.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
      isRedisAvailable = false;
    });

    redis.on('end', () => {
      console.log('🔚 Redis connection ended');
      isRedisAvailable = false;
    });

    // Attempt to connect
    redis.connect().catch((err) => {
      console.warn('⚠️ Redis connection failed, running without Redis:', err.message);
      isRedisAvailable = false;
    });

    return redis;
  } catch (error) {
    console.warn('⚠️ Redis initialization failed, running without Redis:', error);
    isRedisAvailable = false;
    return null as any;
  }
}

// Get Redis client with fallback
export function getRedisClient(): Redis | null {
  if (!redis) {
    redis = initializeRedis();
  }
  return redis;
}

// Check if Redis is available
export function isRedisConnected(): boolean {
  return isRedisAvailable && redis?.status === 'ready';
}

// Safe Redis operation wrapper
export async function safeRedisOperation<T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<T | null> {
  try {
    const client = getRedisClient();
    if (!client || !isRedisConnected()) {
      console.warn('⚠️ Redis not available, using fallback');
      return fallback || null;
    }
    return await operation();
  } catch (error) {
    console.warn('⚠️ Redis operation failed:', error);
    return fallback || null;
  }
}

// Export the default Redis client for backward compatibility
const defaultRedis = initializeRedis();
export default defaultRedis;
