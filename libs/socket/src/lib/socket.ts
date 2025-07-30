import { Server as IOServer, Socket as IOSocket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { parse as parseCookie } from 'cookie';
import { verify } from 'jsonwebtoken';
import { EventEmitter } from 'events';

const ACCESS_TOKEN_SECRET = process.env['ACCESS_TOKEN_SECRET']!;

let io: IOServer | undefined;
export const socketEvents = new EventEmitter();

export function initSocket(server: HTTPServer): IOServer {
  io = new IOServer(server, {
    cors: {
      origin: process.env['FRONTEND_URL'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['polling'], // Force polling only
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use((socket, next) => {
    const cookies = socket.handshake.headers.cookie;
    if (!cookies) return next(new Error('No cookie transmitted.'));

    const parsedCookies = parseCookie(cookies);
    const token = parsedCookies['accessToken'];
    if (!token) return next(new Error('No token found.'));

    try {
      const payload = verify(token, ACCESS_TOKEN_SECRET);
      (socket as any).user = payload;
      next();
    } catch (err) {
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: IOSocket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join user-specific notification room
    const userId = (socket as any).user.id || (socket as any).user._id;
    if (userId) {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined room user-${userId}`);
      socketEvents.emit('userConnected', { userId, socket });
    }

    socket.on('joinChat', (chatId: string) => {
      socket.join(chatId);
      console.log(`↪️ ${socket.id} joined ${chatId}`);
    });

    socket.on('leaveChat', (chatId: string) => {
      socket.leave(chatId);
      console.log(`↩️ ${socket.id} left ${chatId}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): IOServer {
  if (!io) {
    throw new Error(
      'Socket.io not initialized. Call initSocket(server) first.'
    );
  }
  return io;
}
