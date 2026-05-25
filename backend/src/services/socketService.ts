import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server;

export const initializeSocketService = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('[SOCKET] Client connected:', socket.id);

    // Optional: allow client to join a specific user room to target alerts
    socket.on('join-room', (userId) => {
      socket.join(userId);
      console.log(`[SOCKET] Client ${socket.id} joined room ${userId}`);
    });

    socket.on('disconnect', () => {
      console.log('[SOCKET] Client disconnected:', socket.id);
    });
  });

  return io;
};

// Export a function to push emergency alerts
export const triggerPushAlert = (userId: string, payload: any) => {
  if (io) {
    // If a room system is used, emit to the room, else emit globally for demonstration
    // io.to(userId).emit('emergency-alert', payload);
    io.emit('emergency-alert', payload);
    console.log(`[SOCKET] Broadcasted emergency-alert for user ${userId}`);
    return true;
  }
  console.log('[SOCKET] io not initialized');
  return false;
};
