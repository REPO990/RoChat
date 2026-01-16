import { pool } from '../config/database';

export const AnalyticsService = {
  async trackEvent(userId: number, eventType: string, data?: any) {
    try {
      await pool.query(
        `INSERT INTO analytics_events 
         (user_id, event_type, event_data, created_at) 
         VALUES ($1, $2, $3, NOW())`,
        [userId, eventType, data ? JSON.stringify(data) : null]
      );
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  },
  
  async getUserStats(userId: number) {
    try {
      const result = await pool.query(
        `SELECT 
          COUNT(*) as total_messages,
          COUNT(DISTINCT room_id) as rooms_visited,
          MIN(created_at) as first_message,
          MAX(created_at) as last_message
         FROM messages 
         WHERE user_id = $1`,
        [userId]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return null;
    }
  }
};