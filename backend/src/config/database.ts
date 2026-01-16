import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize database tables
export const initDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        roblox_id BIGINT UNIQUE NOT NULL,
        username VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        access_token TEXT,
        refresh_token TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        room_id VARCHAR(255) NOT NULL,
        user_id INTEGER REFERENCES users(id),
        username VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        level VARCHAR(50),
        message TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        await client.query(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        event_type VARCHAR(255) NOT NULL,
        event_data JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_restrictions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        reason TEXT,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_restrictions_user ON user_restrictions(user_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_logs_user ON logs(user_id);
    `);

    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  } finally {
    client.release();
  }
};

export const logToDatabase = async (
  userId: number | null,
  level: string,
  message: string,
  metadata?: any
) => {
  try {
    await pool.query(
      'INSERT INTO logs (user_id, level, message, metadata) VALUES ($1, $2, $3, $4)',
      [userId, level, message, metadata ? JSON.stringify(metadata) : null]
    );
  } catch (error) {
    console.error('Failed to log to database:', error);
  }
};