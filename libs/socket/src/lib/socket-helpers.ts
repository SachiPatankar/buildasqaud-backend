import { getIO } from '@socket';

export function safeEmit(room: string, event: string, data: any) {
  try {
    const io = getIO();
    io.to(room).emit(event, data);
  } catch (error) {
    console.error(`Failed to emit ${event} to ${room}:`, error);
  }
}

export function safeEmitToUser(userId: string, event: string, data: any) {
  safeEmit(`user-${userId}`, event, data);
}

export function safeEmitToChat(chatId: string, event: string, data: any) {
  safeEmit(chatId, event, data);
}
