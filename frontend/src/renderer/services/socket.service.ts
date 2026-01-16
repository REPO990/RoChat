import { io, Socket } from 'socket.io-client';
import { Message } from '../types/index';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string) {
    this.token = token;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from socket server');
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('join-room', roomId);
    }
  }

  leaveRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('leave-room', roomId);
    }
  }

  sendMessage(roomId: string, message: string) {
    if (this.socket) {
      this.socket.emit('send-message', { roomId, message });
    }
  }

  onRoomHistory(callback: (messages: Message[]) => void) {
    if (this.socket) {
      this.socket.on('room-history', callback);
    }
  }

  onNewMessage(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  onUserJoined(callback: (data: { username: string; avatarUrl: string }) => void) {
    if (this.socket) {
      this.socket.on('user-joined', callback);
    }
  }

  onUserLeft(callback: (data: { username: string }) => void) {
    if (this.socket) {
      this.socket.on('user-left', callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
    
  }
    onMessageBlocked(callback: (data: { reason: string; flaggedWords?: string[] }) => void) {
    if (this.socket) {
      this.socket.on('message-blocked', callback);
    }
  }
}

export default new SocketService();