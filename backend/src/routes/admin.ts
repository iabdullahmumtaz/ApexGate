import { Router } from 'express';
import { adminAuth, signToken } from '../middleware/auth.js';
import { getRoutes, saveRoutes } from '../services/routeStore.js';
import { getMetrics, getLogs } from '../services/metrics.js';
import { redis } from '../services/redis.js';

const router = Router();

router.post('/login', adminAuth);

router.use(adminAuth);

router.get('/routes', async (_req, res) => {
  res.json(await getRoutes());
});

router.put('/routes', async (req, res) => {
  const { routes } = req.body;
  if (!Array.isArray(routes)) return res.status(400).json({ error: 'routes array required' });
  await saveRoutes(routes);
  res.json(await getRoutes());
});

router.get('/metrics', async (_req, res) => {
  const metrics = await getMetrics();
  const routes = await getRoutes();
  res.json({ ...metrics, activeRoutes: routes.filter((r) => r.enabled).length });
});

router.get('/logs', async (req, res) => {
  const limit = parseInt(String(req.query.limit ?? '50'), 10);
  res.json(await getLogs(limit));
});

router.delete('/cache', async (_req, res) => {
  const keys = await redis.keys('apexgate:cache:*');
  if (keys.length) await redis.del(...keys);
  res.json({ cleared: keys.length });
});

router.post('/token', (_req, res) => {
  const token = signToken({ role: 'client', sub: 'api-consumer' });
  res.json({ token });
});

export default router;
