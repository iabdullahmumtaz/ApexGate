import { redis } from './redis.js';

const METRICS_KEY = 'apexgate:metrics';
const LOGS_KEY = 'apexgate:logs';

interface RecordRequestInput {
  method: string;
  path: string;
  status: number;
  durationMs: number;
  cached: boolean;
}

export async function recordRequest({ method, path, status, durationMs, cached }: RecordRequestInput) {
  const metrics = await getMetrics();
  metrics.totalRequests += 1;
  if (cached) metrics.cacheHits += 1;
  if (status >= 400) metrics.errors += 1;
  metrics.avgLatencyMs =
    (metrics.avgLatencyMs * (metrics.totalRequests - 1) + durationMs) / metrics.totalRequests;
  metrics.lastRequestAt = new Date().toISOString();
  await redis.set(METRICS_KEY, JSON.stringify(metrics));

  const log = {
    id: crypto.randomUUID(),
    method,
    path,
    status,
    durationMs,
    cached: !!cached,
    timestamp: new Date().toISOString(),
  };
  await redis.lpush(LOGS_KEY, JSON.stringify(log));
  await redis.ltrim(LOGS_KEY, 0, 499);
}

export async function getMetrics() {
  const raw = await redis.get(METRICS_KEY);
  if (!raw) {
    return {
      totalRequests: 0,
      cacheHits: 0,
      errors: 0,
      avgLatencyMs: 0,
      lastRequestAt: null,
    };
  }
  return JSON.parse(raw);
}

export async function getLogs(limit = 50): Promise<unknown[]> {
  const items = await redis.lrange(LOGS_KEY, 0, limit - 1);
  return items.map((item: string) => JSON.parse(item) as Record<string, unknown>);
}
