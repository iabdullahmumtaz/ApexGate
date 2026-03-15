import { useEffect, useState } from 'react';
import { fetchMetrics, clearCache } from '../api';
import type { Metrics } from '../types';

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchMetrics().then(setMetrics).catch(console.error);
    const id = setInterval(() => fetchMetrics().then(setMetrics), 5000);
    return () => clearInterval(id);
  }, []);

  async function handleClearCache() {
    const r = await clearCache();
    setMsg(`Cleared ${r.cleared} cache entries`);
    setTimeout(() => setMsg(''), 3000);
  }

  if (!metrics) return <p>Loading…</p>;

  const hitRate = metrics.totalRequests
    ? ((metrics.cacheHits / metrics.totalRequests) * 100).toFixed(1)
    : '0';

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      {msg && <p style={{ color: 'var(--success)', marginBottom: '1rem' }}>{msg}</p>}
      <div className="metrics-grid">
        <div className="card metric-card">
          <h3>Total Requests</h3>
          <div className="value">{metrics.totalRequests}</div>
        </div>
        <div className="card metric-card">
          <h3>Cache Hit Rate</h3>
          <div className="value">{hitRate}%</div>
        </div>
        <div className="card metric-card">
          <h3>Avg Latency</h3>
          <div className="value">{metrics.avgLatencyMs.toFixed(0)}ms</div>
        </div>
        <div className="card metric-card">
          <h3>Errors</h3>
          <div className="value">{metrics.errors}</div>
        </div>
        <div className="card metric-card">
          <h3>Active Routes</h3>
          <div className="value">{metrics.activeRoutes}</div>
        </div>
      </div>
      <div className="toolbar">
        <button onClick={handleClearCache}>Clear Response Cache</button>
      </div>
      <div className="card">
        <h3 style={{ marginBottom: '0.5rem' }}>Quick Start</h3>
        <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
          Gateway listens on configured paths. Try <code>GET /api/posts</code> (cached, public)
          or <code>GET /api/users</code> (requires JWT from POST /admin/token).
        </p>
      </div>
    </div>
  );
}
