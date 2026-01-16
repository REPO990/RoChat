import { pool } from '../config/database';

export interface User {
  id: number;
  roblox_id: number;
  username: string;
  avatar_url: string;
  access_token?: string;
  refresh_token?: string;
  created_at: Date;
}

export const UserModel = {
  async findByRobloxId(robloxId: number): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE roblox_id = $1',
      [robloxId]
    );
    return result.rows[0] || null;
  },

  async create(userData: {
    roblox_id: number;
    username: string;
    avatar_url: string;
    access_token: string;
    refresh_token: string;
  }): Promise<User> {
    const result = await pool.query(
      `INSERT INTO users (roblox_id, username, avatar_url, access_token, refresh_token)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        userData.roblox_id,
        userData.username,
        userData.avatar_url,
        userData.access_token,
        userData.refresh_token,
      ]
    );
    return result.rows[0];
  },

  async updateTokens(
    robloxId: number,
    accessToken: string,
    refreshToken: string
  ): Promise<User> {
    const result = await pool.query(
      `UPDATE users SET access_token = $1, refresh_token = $2
       WHERE roblox_id = $3
       RETURNING *`,
      [accessToken, refreshToken, robloxId]
    );
    return result.rows[0];
  },
  
   async updateRefreshToken(
    id: number,
    refreshToken: string
  ): Promise<User> {
    const result = await pool.query(
      `UPDATE users SET refresh_token = $1
       WHERE id = $2
       RETURNING *`,
      [refreshToken, id]
    );
    return result.rows[0];
  },
  async findById(id: number): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  },
};
