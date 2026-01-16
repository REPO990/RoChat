import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { RobloxService } from '../services/roblox.service';
import { UserModel } from '../models/User';
import { logToDatabase } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

const JWT_SECRET = process.env.JWT_SECRET!;

export const AuthController = {
  // Redirect to Roblox OAuth
 async login(req: AuthRequest, res: Response) {
  console.log('Login endpoint called'); // Check your backend terminal for this log
  try {
    const authUrl = RobloxService.getAuthUrl();
    console.log('Redirecting to:', authUrl); // Check this log too
    res.redirect(authUrl);
  } catch (error) {
    console.error('Login controller error:', error);
    res.status(500).send('Auth failed');
  }
},
  // Handle OAuth callback
  async callback(req: AuthRequest, res: Response) {
    try {
      const { code } = req.query;

      if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: 'Authorization code missing' });
      }

      // Exchange code for tokens
      const tokens = await RobloxService.exchangeCode(code);
      const userInfo = await RobloxService.getUserInfo(tokens.access_token);

      const robloxId = parseInt(userInfo.sub);
      const username = userInfo.preferred_username || userInfo.name;
      const avatarUrl = userInfo.picture;

      // Check if user exists
      let user = await UserModel.findByRobloxId(robloxId);

      if (user) {
        // Update tokens
        user = await UserModel.updateTokens(
          robloxId,
          tokens.access_token,
          tokens.refresh_token
        );
      } else {
        // Create new user
        user = await UserModel.create({
          roblox_id: robloxId,
          username,
          avatar_url: avatarUrl,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
        });
      }

      // Generate JWT tokens
      const accessToken = jwt.sign(
        {
          id: user.id,
          robloxId: user.roblox_id,
          username: user.username,
        },
        JWT_SECRET,
        { expiresIn: '15m' }  // Short expiration for access token
      );

      const refreshToken = jwt.sign(
        { id: user.id, robloxId: user.roblox_id },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '30d' }
      );

      // Update the refresh token in the database
      await UserModel.updateRefreshToken(user.id, refreshToken);

      await logToDatabase(user.id, 'info', 'User logged in', { username });

      // Redirect to frontend with tokens
      res.redirect(`http://localhost:3000?accessToken=${accessToken}&refreshToken=${refreshToken}`);

    } catch (error: any) {
      console.error('OAuth callback error:', error);
      await logToDatabase(null, 'error', 'OAuth callback failed', {
        error: error.message,
      });
      res.status(500).json({ error: 'Authentication failed' });
    }
  },

  // Verify JWT token
  async verify(req: AuthRequest, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ error: 'Token missing' });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: number;
        robloxId: number;
        username: string;
      };

      const user = await UserModel.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      res.json({
        valid: true,
        user: {
          id: user.id,
          robloxId: user.roblox_id,
          username: user.username,
          avatarUrl: user.avatar_url,
        },
      });
    } catch (error) {
      res.status(401).json({ valid: false, error: 'Invalid token' });
    }
  },

  // Refresh access token
  async refresh(req: AuthRequest, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token missing' });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
        id: number;
        robloxId: number;
      };

      const user = await UserModel.findById(decoded.id);

      if (!user || user.refresh_token !== refreshToken) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      // Generate new access token
      const accessToken = jwt.sign(
        {
          id: user.id,
          robloxId: user.roblox_id,
          username: user.username,
        },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      await logToDatabase(user.id, 'info', 'Token refreshed');

      res.json({ accessToken });
    } catch (error) {
      res.status(401).json({ error: 'Token refresh failed' });
    }
  },

  // Get user presence (current game)
  async getPresence(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await UserModel.findById(req.user.id);

      if (!user || !user.access_token) {
        return res.status(401).json({ error: 'User not found' });
      }

      const presence = await RobloxService.getUserPresence(
        user.roblox_id,
        user.access_token
      );

      res.json(presence);
    } catch (error: any) {
      console.error('Get presence error:', error);
      await logToDatabase(req.user?.id || null, 'error', 'Get presence failed', {
        error: error.message,
      });
      res.status(500).json({ error: 'Failed to get presence' });
    }
  },
};

export default AuthController;