import { getRedisClient, isRedisConnected, safeRedisOperation } from './redis';

export async function incrementChatCount(userId: string, chatId: string) {
  return safeRedisOperation(async () => {
    const redis = getRedisClient();
    if (!redis) return null;
    
    const multi = redis.multi();
    multi.hincrby(`user:${userId}:chats`, chatId, 1);
    multi.incr(`user:${userId}:total`);
    await multi.exec();
    return true;
  }, null);
}

// Atomic reset chat count and recalculate total
export async function resetChatCount(
  userId: string,
  chatId: string,
  newCount = 0
) {
  return safeRedisOperation(async () => {
    const redis = getRedisClient();
    if (!redis) return null;
    
    const multi = redis.multi();
    multi.hset(`user:${userId}:chats`, chatId, newCount);

    // Get all counts to recalculate total
    const counts = await getChatCounts(userId);
    counts[chatId] = newCount; // Update with new count
    const total = Object.values(counts).reduce((sum, c) => sum + Number(c), 0);

    multi.set(`user:${userId}:total`, total);
    await multi.exec();
    return true;
  }, null);
}

// Batch set multiple chat counts and total
export async function batchSetChatCounts(
  userId: string,
  chatCounts: Record<string, number>
) {
  return safeRedisOperation(async () => {
    const redis = getRedisClient();
    if (!redis) return null;
    
    const multi = redis.multi();

    // Clear existing hash and set new values
    multi.del(`user:${userId}:chats`);
    if (Object.keys(chatCounts).length > 0) {
      multi.hmset(`user:${userId}:chats`, chatCounts);
    }

    const total = Object.values(chatCounts).reduce(
      (sum, c) => sum + Number(c),
      0
    );
    multi.set(`user:${userId}:total`, total);

    await multi.exec();
    return true;
  }, null);
}

// Get all chat unread counts for a user
export async function getChatCounts(
  userId: string
): Promise<Record<string, number>> {
  return safeRedisOperation(async () => {
    const redis = getRedisClient();
    if (!redis) return {};
    
    const data = await redis.hgetall(`user:${userId}:chats`);
    // Convert string values to numbers
    return Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, Number(v)])
    );
  }, {}) || {};
}

// Get total unread count for a user
export async function getTotalCount(userId: string): Promise<number> {
  return safeRedisOperation(async () => {
    const redis = getRedisClient();
    if (!redis) return 0;
    
    const val = await redis.get(`user:${userId}:total`);
    return Number(val) || 0;
  }, 0) || 0;
}

// Set expiration on all keys for a user (e.g., on disconnect)
export async function expireUserKeys(userId: string, seconds: number) {
  return safeRedisOperation(async () => {
    const redis = getRedisClient();
    if (!redis) return null;
    
    await redis.expire(`user:${userId}:chats`, seconds);
    await redis.expire(`user:${userId}:total`, seconds);
    return true;
  }, null);
}

// Check if Redis is available
export function isRedisAvailable(): boolean {
  return isRedisConnected();
}
