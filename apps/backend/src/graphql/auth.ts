import jwt from 'jsonwebtoken';
import { User } from '@db';
import { Request } from 'express';

const JWT_SECRET = process.env.JWT_SECRET;

export const getCurrentUserFromReq = async (
  req: Request
): Promise<{ id: string; email: string } | null> => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return null;

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET!);
    const userId = decoded.sub;
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found:', userId);
      return null;
    }
    return { id: userId, email: user.email };
  } catch (err) {
    console.error('Invalid token:', err);
    return null;
  }
};
