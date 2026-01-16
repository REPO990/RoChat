import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { MessageModel } from '../models/Message';
import { logToDatabase } from '../config/database';
import { ModerationService } from './moderation.service';
import { AnalyticsService } from './analytics.service';
const JWT_SECRET = process.env.JWT_SECRET!;

interface AuthenticatedSocket extends Socket {
  userId?: number;
  username?: string;
  avatarUrl?: string;
  currentRoom?: string;
}

export const initializeSocket = (io: Server) => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: number;
        robloxId: number;
        username: string;
      };

      const user = await UserModel.findById(decoded.id);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user.id;
      socket.username = user.username;
      socket.avatarUrl = user.avatar_url;

      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`✅ User connected: ${socket.username} (ID: ${socket.userId})`);

    logToDatabase(
      socket.userId!,
      'info',
      'User connected to socket',
      { socketId: socket.id }
    );

    // Join a chat room
    socket.on('join-room', async (roomId: string) => {
      try {
        // Leave previous room
        if (socket.currentRoom) {
          socket.leave(socket.currentRoom);
          console.log(`User ${socket.username} left room: ${socket.currentRoom}`);
        }

        // Join new room
        socket.join(roomId);
        socket.currentRoom = roomId;

        console.log(`User ${socket.username} joined room: ${roomId}`);

        // Send room history
        const messages = await MessageModel.getByRoom(roomId, 50);
        socket.emit('room-history', messages);

        // Notify others
        socket.to(roomId).emit('user-joined', {
          username: socket.username,
          avatarUrl: socket.avatarUrl,
        });

        await logToDatabase(
          socket.userId!,
          'info',
          'User joined room',
          { roomId }
        );
      } catch (error: any) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Send a message
        // Send a message
    socket.on('send-message', async (data: { roomId: string; message: string }) => {
      try {
        const { roomId, message } = data;

        if (!message || message.trim().length === 0) {
          return;
        }

        // Moderation check
        const moderationResult = await ModerationService.checkMessage(message);
        if (!moderationResult.isSafe) {
          socket.emit('message-blocked', {
            reason: 'Inappropriate language',
            flaggedWords: moderationResult.flaggedWords
          });
          await logToDatabase(
            socket.userId!,
            'warning',
            'Message blocked by moderation',
            { message: message.substring(0, 50), riskLevel: moderationResult.riskLevel }
          );
          return;
        }

        // Save message to database
        const savedMessage = await MessageModel.create({
          room_id: roomId,
          user_id: socket.userId!,
          username: socket.username!,
          avatar_url: socket.avatarUrl!,
          message: message.trim(),
        });

        // Track analytics
        await AnalyticsService.trackEvent(socket.userId!, 'message_sent', {
          roomId,
          messageLength: message.length
        });

        // Broadcast to room
        io.to(roomId).emit('new-message', savedMessage);

        console.log(`Message in ${roomId} from ${socket.username}: ${message}`);
      } catch (error: any) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Leave room
    socket.on('leave-room', (roomId: string) => {
      socket.leave(roomId);
      socket.currentRoom = undefined;

      socket.to(roomId).emit('user-left', {
        username: socket.username,
      });

      console.log(`User ${socket.username} left room: ${roomId}`);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.username}`);

      if (socket.currentRoom) {
        socket.to(socket.currentRoom).emit('user-left', {
          username: socket.username,
        });
      }

      logToDatabase(
        socket.userId!,
        'info',
        'User disconnected from socket',
        { socketId: socket.id }
      );
    });
  });
};