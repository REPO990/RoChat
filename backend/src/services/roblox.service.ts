import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const ROBLOX_CLIENT_ID = process.env.ROBLOX_CLIENT_ID!;
const ROBLOX_CLIENT_SECRET = process.env.ROBLOX_CLIENT_SECRET!;
const ROBLOX_REDIRECT_URI = process.env.ROBLOX_REDIRECT_URI!;

export const RobloxService = {
  // Get OAuth2 authorization URL
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: ROBLOX_CLIENT_ID,
      redirect_uri: ROBLOX_REDIRECT_URI,
      scope: 'openid profile',
      response_type: 'code',
    });
    return `https://apis.roblox.com/oauth/v1/authorize?${params.toString()}`;
  },

  // Exchange authorization code for tokens
  async exchangeCode(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    const response = await axios.post(
      'https://apis.roblox.com/oauth/v1/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: ROBLOX_CLIENT_ID,
        client_secret: ROBLOX_CLIENT_SECRET,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );
    return response.data;
  },

  // Get user info from access token
  async getUserInfo(accessToken: string): Promise<{
    sub: string;
    name: string;
    nickname: string;
    picture: string;
    preferred_username: string;
  }> {
    const response = await axios.get(
      'https://apis.roblox.com/oauth/v1/userinfo',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.data;
  },

  // Get user's current game presence
  async getUserPresence(
    robloxId: number,
    accessToken: string
  ): Promise<{
    placeId: number | null;
    jobId: string | null;
    isOnline: boolean;
  }> {
    try {
      const response = await axios.post(
        'https://presence.roblox.com/v1/presence/users',
        {
          userIds: [robloxId],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const presence = response.data.userPresences[0];
      
      if (presence && presence.userPresenceType === 2) {
        // Type 2 = In-game
        return {
          placeId: presence.placeId || null,
          jobId: presence.gameId || null,
          isOnline: true,
        };
      }

      return { placeId: null, jobId: null, isOnline: false };
    } catch (error) {
      console.error('Error fetching user presence:', error);
      return { placeId: null, jobId: null, isOnline: false };
    }
  },
};