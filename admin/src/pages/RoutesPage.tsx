import { useEffect, useState } from 'react';
import { fetchRoutes, saveRoutes } from '../api';
import type { RouteConfig } from '../types';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const emptyRoute = (): RouteConfig => ({
  id: crypto.randomUUID(),
  name: 'New Route',
  path: '/api/new',
  target: 'https://httpbin.org/get',
  methods: ['GET'],
  cacheEnabled: false,
  cacheTtl: 60,
  rateLimit: 100,
  authRequired: false,
  enabled: true,
});

export default function RoutesPage() {
  const [routes, setRoutes] = useState<RouteConfig[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchRoutes().then(setRoutes);
  }, []);

  function updateRoute(i: number, field: keyof RouteConfig, value: RouteConfig[keyof RouteConfig]) {
    const next = [...routes];
    next[i] = { ...next[i], [field]: value };
    setRoutes(next);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const saved = await saveRoutes(routes);
      setRoutes(saved);
      setMsg('Routes saved');
    } catch {
      setMsg('Save failed');
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(''), 3000);
    }
  }

  return (
    <section>
      <h1 className="page-title">Route Configuration</h1>
      {msg && <p style={{ marginBottom: '1rem', color: 'var(--success)' }}>{msg}</p>}
      <div className="toolbar">
        <button onClick={() => setRoutes([...routes, emptyRoute()])}>Add Route</button>
        <button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save All'}</button>
      </div>
      <div className="route-editor">
        {routes.map((r, i) => (
          <div key={r.id} className="route-item card">
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input value={r.name} onChange={(e) => updateRoute(i, 'name', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Path</label>
                <input value={r.path} onChange={(e) => updateRoute(i, 'path', e.target.value)} />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '0.75rem' }}>
              <label>Target URL</label>
              <input value={r.target} onChange={(e) => updateRoute(i, 'target', e.target.value)} />
            </div>
            <div className="form-row" style={{ marginTop: '0.75rem' }}>
              <div className="form-group">
                <label>Rate Limit / min</label>
                <input type="number" value={r.rateLimit} onChange={(e) => updateRoute(i, 'rateLimit', +e.target.value)} />
              </div>
              <div className="form-group">
                <label>Cache TTL (sec)</label>
                <input type="number" value={r.cacheTtl} onChange={(e) => updateRoute(i, 'cacheTtl', +e.target.value)} disabled={!r.cacheEnabled} />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '0.75rem' }}>
              <label>HTTP Methods</label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {HTTP_METHODS.map((m) => (
                  <label key={m}>
                    <input
                      type="checkbox"
                      checked={r.methods?.includes(m)}
                      onChange={(e) => {
                        const methods = e.target.checked
                          ? [...(r.methods || []), m]
                          : (r.methods || []).filter((x) => x !== m);
                        updateRoute(i, 'methods', methods.length ? methods : ['GET']);
                      }}
                    />{' '}{m}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <label><input type="checkbox" checked={r.enabled} onChange={(e) => updateRoute(i, 'enabled', e.target.checked)} /> Enabled</label>
              <label><input type="checkbox" checked={r.cacheEnabled} onChange={(e) => updateRoute(i, 'cacheEnabled', e.target.checked)} /> Cache</label>
              <label><input type="checkbox" checked={r.authRequired} onChange={(e) => updateRoute(i, 'authRequired', e.target.checked)} /> JWT Required</label>
            </div>
            <button className="danger" style={{ marginTop: '0.75rem' }} onClick={() => setRoutes(routes.filter((_, j) => j !== i))}>Remove</button>
          </div>
        ))}
      </div>
    </section>
  );
}
