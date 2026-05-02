export interface RouteConfig {
  id: string;
  name: string;
  path: string;
  target: string;
  methods: string[];
  cacheEnabled: boolean;
  cacheTtl: number;
  rateLimit: number;
  authRequired: boolean;
  enabled: boolean;
}

export interface Metrics {
  totalRequests: number;
  cacheHits: number;
  errors: number;
  avgLatencyMs: number;
  lastRequestAt: string | null;
  activeRoutes?: number;
}

export interface RequestLog {
  id: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
  cached: boolean;
  timestamp: string;
}
