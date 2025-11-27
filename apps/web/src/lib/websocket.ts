import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export interface ServerToClientEvents {
  'page:update': (data: { pageId: string; content: string; userId: string }) => void;
  'user:joined': (data: { userId: string; userName: string; pageId: string }) => void;
  'user:left': (data: { userId: string; pageId: string }) => void;
  'comment:new': (data: { commentId: string; pageId: string; content: string }) => void;
  'cursor:move': (data: { userId: string; position: any }) => void;
  'notification': (data: { type: string; message: string; userId: string }) => void;
}

export interface ClientToServerEvents {
  'page:join': (pageId: string) => void;
  'page:leave': (pageId: string) => void;
  'page:edit': (data: { pageId: string; content: string }) => void;
  'cursor:update': (data: { pageId: string; position: any }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  userName: string;
  email: string;
}

let io: SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> | null = null;

export function initializeWebSocketServer(httpServer: HTTPServer) {
  if (io) {
    return io;
  }

  io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        return next(new Error('Unauthorized'));
      }

      socket.data.userId = session.user.id;
      socket.data.userName = session.user.name || 'Anonymous';
      socket.data.email = session.user.email || '';
      
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    console.log(`User connected: ${socket.data.userName} (${socket.data.userId})`);

    // Join a page room
    socket.on('page:join', (pageId: string) => {
      socket.join(`page:${pageId}`);
      
      // Notify others in the room
      socket.to(`page:${pageId}`).emit('user:joined', {
        userId: socket.data.userId,
        userName: socket.data.userName,
        pageId,
      });

      console.log(`${socket.data.userName} joined page: ${pageId}`);
    });

    // Leave a page room
    socket.on('page:leave', (pageId: string) => {
      socket.leave(`page:${pageId}`);
      
      // Notify others in the room
      socket.to(`page:${pageId}`).emit('user:left', {
        userId: socket.data.userId,
        pageId,
      });

      console.log(`${socket.data.userName} left page: ${pageId}`);
    });

    // Page editing events
    socket.on('page:edit', async (data) => {
      const { pageId, content } = data;
      
      // Broadcast to all users in the page room except sender
      socket.to(`page:${pageId}`).emit('page:update', {
        pageId,
        content,
        userId: socket.data.userId,
      });

      // TODO: Save to database with debouncing
      console.log(`Page ${pageId} edited by ${socket.data.userName}`);
    });

    // Cursor position updates
    socket.on('cursor:update', (data) => {
      const { pageId, position } = data;
      
      // Broadcast cursor position to others
      socket.to(`page:${pageId}`).emit('cursor:move', {
        userId: socket.data.userId,
        position,
      });
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.userName}`);
    });
  });

  return io;
}

export function getWebSocketServer() {
  if (!io) {
    throw new Error('WebSocket server not initialized');
  }
  return io;
}

// Helper function to send notifications
export function sendNotification(userId: string, notification: {
  type: string;
  message: string;
}) {
  if (!io) return;
  
  io.to(`user:${userId}`).emit('notification', {
    ...notification,
    userId,
  });
}
