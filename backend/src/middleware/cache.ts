import type { Request } from 'express';
import { redis } from '../services/redis.js';

function cacheKey(method: string, path: string, query: Request['query']): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (typeof v === 'string') params.set(k, v);
    else if (Array.isArray(v)) v.forEach((x) => typeof x === 'string' && params.append(k, x));
  }
  const q = params.toString();
  return `apexgate:cache:${method}:${path}${q ? `?${q}` : ''}`;
}

export async function getCachedResponse(req: Request): Promise<{ body: unknown; status: number } | null> {
  if (req.method !== 'GET' || !req.routeConfig?.cacheEnabled) return null;
  const key = cacheKey(req.method, req.path, req.query);
  const raw = await redis.get(key);
  if (!raw) return null;
  return JSON.parse(raw) as { body: unknown; status: number };
}

export async function setCachedResponse(req: Request, body: unknown, status: number, ttl?: number): Promise<void> {
  if (req.method !== 'GET' || !req.routeConfig?.cacheEnabled) return;
  const key = cacheKey(req.method, req.path, req.query);
  const seconds = ttl ?? req.routeConfig?.cacheTtl ?? parseInt(process.env.CACHE_TTL_SECONDS || '300', 10);
  await redis.setex(key, seconds, JSON.stringify({ body, status }));
}
