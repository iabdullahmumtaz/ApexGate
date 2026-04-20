import type { JwtPayload } from 'jsonwebtoken';

export interface RouteConfig {
  id: string;
  name: string;
  path: string;
  target: string;
  methods: string[];
  cacheEnabled?: boolean;
  cacheTtl?: number;
  rateLimit?: number;
  authRequired?: boolean;
  enabled?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
      user?: JwtPayload & { username?: string };
      routeConfig?: RouteConfig;
      _durationMs?: number;
      _statusCode?: number;
    }
  }
}

export {};
