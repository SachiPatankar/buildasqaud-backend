// socket.ts
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

    // join a chat room
    socket.on(
      'joinChat',
      (
        chatId: string,
        ack?: (status: { ok: boolean; room: string }) => void
      ) => {
        socket.join(chatId);
        console.log(`↪️ ${socket.id} joined ${chatId}`);
        ack?.({ ok: true, room: chatId });
      }
    );

    // leave a chat room
    socket.on(
      'leaveChat',
      (
        chatId: string,
        ack?: (status: { ok: boolean; room: string }) => void
      ) => {
        socket.leave(chatId);
        console.log(`↩️ ${socket.id} left ${chatId}`);
        ack?.({ ok: true, room: chatId });
      }
    );

    // handle disconnects
    socket.on('disconnect', (reason) => {
      console.log(`❌ Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}

/**
 * Returns the initialized Socket.IO server.
 * Throws if initSocket() hasn’t been called.
 */
export function getIO(): IOServer {
  if (!io) {
    throw new Error(
      'Socket.io not initialized. Make sure you called initSocket(server) first.'
    );
  }
  return io;
}
