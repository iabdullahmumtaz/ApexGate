import type { RouteConfig } from '../types/express.js';
import { redis } from './redis.js';

const ROUTES_KEY = 'apexgate:routes';

const defaultRoutes: RouteConfig[] = [
  {
    id: 'demo-json',
    name: 'JSONPlaceholder Posts',
    path: '/api/posts',
    target: 'https://jsonplaceholder.typicode.com/posts',
    methods: ['GET'],
    cacheEnabled: true,
    cacheTtl: 120,
    rateLimit: 60,
    authRequired: false,
    enabled: true,
  },
  {
    id: 'demo-users',
    name: 'JSONPlaceholder Users',
    path: '/api/users',
    target: 'https://jsonplaceholder.typicode.com/users',
    methods: ['GET'],
    cacheEnabled: true,
    cacheTtl: 300,
    rateLimit: 30,
    authRequired: true,
    enabled: true,
  },
];

export async function getRoutes(): Promise<RouteConfig[]> {
  const raw = await redis.get(ROUTES_KEY);
  if (!raw) {
    await redis.set(ROUTES_KEY, JSON.stringify(defaultRoutes));
    return defaultRoutes;
  }
  return JSON.parse(raw);
}

export async function saveRoutes(routes: RouteConfig[]): Promise<RouteConfig[]> {
  await redis.set(ROUTES_KEY, JSON.stringify(routes));
  return routes;
}

export async function getRouteByPath(path: string): Promise<RouteConfig | undefined> {
  const routes = await getRoutes();
  return routes.find((r) => r.enabled && r.path === path);
}
