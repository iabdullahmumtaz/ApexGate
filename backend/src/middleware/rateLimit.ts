import type { Request, Response, NextFunction } from 'express';
import { redis } from '../services/redis.js';

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);

export function createRateLimiter(maxRequests = 100) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `apexgate:rl:${req.ip}:${req.routeConfig?.id || req.path}`;
    const limit = req.routeConfig?.rateLimit ?? maxRequests;
    const windowSec = Math.ceil(WINDOW_MS / 1000);

    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSec);

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - count));

    if (count > limit) {
      return res.status(429).json({ error: 'Rate limit exceeded', retryAfter: windowSec });
    }
    next();
  };
}
