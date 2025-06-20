// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  sub: string; // your user ID
  email: string;
  iat: number;
  exp: number;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.slice(7); // remove "Bearer "
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // attach the user info into req.user for downstream handlers
    req.user = { _id: payload.sub, email: payload.email };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
