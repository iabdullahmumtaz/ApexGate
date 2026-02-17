import type { Request, Response, NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export function signToken(payload: JwtPayload | object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function jwtAuth(required = true) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      if (required) return res.status(401).json({ error: 'Missing or invalid token' });
      return next();
    }
    try {
      const token = header.slice(7);
      req.user = verifyToken(token);
      next();
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const { username, password } = (req.body || {}) as { username?: string; password?: string };
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

  if (req.method === 'POST' && req.path.endsWith('/login')) {
    if (username === adminUser && password === adminPass) {
      const token = signToken({ role: 'admin', username });
      return res.json({ token, username });
    }
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  return jwtAuth(true)(req, res, next);
}
