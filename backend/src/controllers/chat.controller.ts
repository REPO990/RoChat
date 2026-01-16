import { Response } from 'express';
import { MessageModel } from '../models/Message';
import { AuthRequest } from '../middleware/auth.middleware';

export const ChatController = {
  // Get chat history for a room
  async getHistory(req: AuthRequest, res: Response) {
    try {
      const { roomId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const messages = await MessageModel.getByRoom(roomId, limit);

      res.json({ messages });
    } catch (error: any) {
      console.error('Get chat history error:', error);
      res.status(500).json({ error: 'Failed to get chat history' });
    }
  },
};