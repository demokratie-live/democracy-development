import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send('Authorization header missing');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).send('Token missing');
  }

  const secret = process.env.NON_NAMED_VOTES_AI_SECRET;

  if (!secret) {
    return res.status(500).send('Server configuration error');
  }

  const tokenBuffer = Buffer.from(token);
  const secretBuffer = Buffer.from(secret);

  if (tokenBuffer.length !== secretBuffer.length || !crypto.timingSafeEqual(tokenBuffer, secretBuffer)) {
    return res.status(401).send('Unauthorized');
  }

  return next();
};
