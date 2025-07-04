import { Server as IOServer, Socket as IOSocket } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: IOServer | undefined;

/**
 * Initialize Socket.IO on an existing HTTP server.
 * Must be called once, before you call getIO().
 */
export function initSocket(server: HTTPServer): IOServer {
  io = new IOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: IOSocket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Handle user joining chat room
    socket.on('joinChat', (chatId: string) => {
      socket.join(chatId);
      console.log(`↪️ ${socket.id} joined ${chatId}`);
    });

    // Handle user leaving chat room
    socket.on('leaveChat', (chatId: string) => {
      socket.leave(chatId);
      console.log(`↩️ ${socket.id} left ${chatId}`);
    });

    // Handle disconnects
    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Returns the initialized Socket.IO server.
 * Throws if initSocket() hasn't been called.
 */
export function getIO(): IOServer {
  if (!io) {
    throw new Error(
      'Socket.io not initialized. Make sure you called initSocket(server) first.'
    );
  }
  return io;
}
