import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { getRouteByPath } from './services/routeStore.js';
import { getCachedResponse, setCachedResponse } from './middleware/cache.js';
import { createRateLimiter } from './middleware/rateLimit.js';
import { jwtAuth } from './middleware/auth.js';
import { recordRequest } from './services/metrics.js';

const globalRateLimit = createRateLimiter(
  parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
);

export async function gatewayHandler(req: Request, res: Response, next: NextFunction) {
  const route = await getRouteByPath(req.path);
  if (!route) return next();

  req.routeConfig = route;

  if (!route.methods.includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const runProxy = async () => {
    const start = Date.now();
    let cached = false;

    try {
      const cachedResp = await getCachedResponse(req);
      if (cachedResp) {
        cached = true;
        res.status(cachedResp.status).setHeader('X-Cache', 'HIT');
        if (typeof cachedResp.body === 'object') {
          return res.json(cachedResp.body);
        }
        return res.send(cachedResp.body);
      }

      const url = new URL(req.originalUrl.replace(route.path, ''), route.target);
      const headers: Record<string, string> = { host: new URL(route.target).host };
      for (const [key, value] of Object.entries(req.headers)) {
        if (key.toLowerCase() === 'authorization' || value === undefined) continue;
        headers[key] = Array.isArray(value) ? value.join(', ') : String(value);
      }

      const response = await fetch(url.toString(), {
        method: req.method,
        headers,
        body: ['GET', 'HEAD'].includes(req.method)
          ? undefined
          : typeof req.body === 'string'
            ? req.body
            : JSON.stringify(req.body),
      });

      const contentType = response.headers.get('content-type') || '';
      let body;
      if (contentType.includes('application/json')) {
        body = await response.json();
        await setCachedResponse(req, body, response.status, route.cacheTtl);
        res.status(response.status).setHeader('X-Cache', 'MISS');
        res.json(body);
      } else {
        body = await response.text();
        res.status(response.status).setHeader('X-Cache', 'MISS').send(body);
      }

      await recordRequest({
        method: req.method,
        path: req.path,
        status: response.status,
        durationMs: Date.now() - start,
        cached,
      });
    } catch (err) {
      await recordRequest({
        method: req.method,
        path: req.path,
        status: 502,
        durationMs: Date.now() - start,
        cached: false,
      });
      res.status(502).json({ error: 'Upstream error', message: err instanceof Error ? err.message : String(err) });
    }
  };

  const chain: RequestHandler[] = [globalRateLimit];
  if (route.authRequired) chain.push(jwtAuth(true));
  chain.push(runProxy as RequestHandler);

  let i = 0;
  const dispatch: NextFunction = () => {
    if (i >= chain.length) return;
    const fn = chain[i++];
    fn(req, res, dispatch);
  };
  dispatch();
}
