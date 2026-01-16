import axios from 'axios';
import { User, GamePresence } from '../types/index';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const RobloxService = {
  async verifyToken(token: string): Promise<User | null> {
    try {
      const response = await axios.post(`${API_URL}/auth/verify`, { token });
      return response.data.user;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  },

  async getUserPresence(token: string): Promise<GamePresence> {
    try {
      const response = await axios.get(`${API_URL}/auth/presence`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get user presence:', error);
      return { placeId: null, jobId: null, isOnline: false };
    }
  },

  async getChatHistory(token: string, roomId: string) {
    try {
      const response = await axios.get(`${API_URL}/chat/history/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.messages;
    } catch (error) {
      console.error('Failed to get chat history:', error);
      return [];
    }
  },

  getAuthUrl(): string {
    return `${API_URL}/auth/roblox`;
  },
};