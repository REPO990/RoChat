import { pool } from '../config/database';

export interface Message {
  id: number;
  room_id: string;
  user_id: number;
  username: string;
  avatar_url: string;
  message: string;
  created_at: Date;
}

export const MessageModel = {
  async create(messageData: {
    room_id: string;
    user_id: number;
    username: string;
    avatar_url: string;
    message: string;
  }): Promise<Message> {
    const result = await pool.query(
      `INSERT INTO messages (room_id, user_id, username, avatar_url, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        messageData.room_id,
        messageData.user_id,
        messageData.username,
        messageData.avatar_url,
        messageData.message,
      ]
    );
    return result.rows[0];
  },

  async getByRoom(roomId: string, limit: number = 50): Promise<Message[]> {
    const result = await pool.query(
      `SELECT * FROM messages 
       WHERE room_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [roomId, limit]
    );
    return result.rows.reverse(); // Return oldest first
  },
};