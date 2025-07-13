import redis from './redis';

// Increment unread count for a chat and total for a user
export async function incrementChatCount(userId: string, chatId: string) {
  await redis.hincrby(`user:${userId}:chats`, chatId, 1);
}

export async function incrementTotalCount(userId: string) {
  await redis.incr(`user:${userId}:total`);
}

// Reset unread count for a chat and recalculate total for a user
export async function resetChatCount(userId: string, chatId: string, newCount = 0) {
  await redis.hset(`user:${userId}:chats`, chatId, newCount);
  // Recalculate total
  const counts = await getChatCounts(userId);
  const total = Object.values(counts).reduce((sum, c) => sum + Number(c), 0);
  await setTotalCount(userId, total);
}

// Get all chat unread counts for a user
export async function getChatCounts(userId: string): Promise<Record<string, number>> {
  const data = await redis.hgetall(`user:${userId}:chats`);
  // Convert string values to numbers
  return Object.fromEntries(Object.entries(data).map(([k, v]) => [k, Number(v)]));
}

// Get total unread count for a user
export async function getTotalCount(userId: string): Promise<number> {
  const val = await redis.get(`user:${userId}:total`);
  return Number(val) || 0;
}

// Set total unread count for a user
export async function setTotalCount(userId: string, count: number) {
  await redis.set(`user:${userId}:total`, count);
}

// Set expiration on all keys for a user (e.g., on disconnect)
export async function expireUserKeys(userId: string, seconds: number) {
  await redis.expire(`user:${userId}:chats`, seconds);
  await redis.expire(`user:${userId}:total`, seconds);
} 