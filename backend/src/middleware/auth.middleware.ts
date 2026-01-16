import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthRequest extends Request {
  user?: {
    id: number;
    robloxId: number;
    username: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  
  next: NextFunction
  
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
      
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

    req.user = {
      id: user.id,
      robloxId: user.roblox_id,
      username: user.username,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export default authMiddleware;