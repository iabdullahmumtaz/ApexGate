import type { Metrics, RequestLog, RouteConfig } from './types';

const API = import.meta.env.VITE_API_URL || 'http://localhost:6016';

function headers(): HeadersInit {
  const token = localStorage.getItem('apexgate_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  const data = (await res.json()) as { token: string; username: string };
  localStorage.setItem('apexgate_token', data.token);
  return data;
}

export async function fetchRoutes(): Promise<RouteConfig[]> {
  const res = await fetch(`${API}/admin/routes`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to load routes');
  return res.json();
}

export async function saveRoutes(routes: RouteConfig[]): Promise<RouteConfig[]> {
  const res = await fetch(`${API}/admin/routes`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ routes }),
  });
  if (!res.ok) throw new Error('Failed to save');
  return res.json();
}

export async function fetchMetrics(): Promise<Metrics> {
  const res = await fetch(`${API}/admin/metrics`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to load metrics');
  return res.json();
}

export async function fetchLogs(limit = 50): Promise<RequestLog[]> {
  const res = await fetch(`${API}/admin/logs?limit=${limit}`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to load logs');
  return res.json();
}

export async function clearCache() {
  const res = await fetch(`${API}/admin/cache`, { method: 'DELETE', headers: headers() });
  if (!res.ok) throw new Error('Failed to clear cache');
  return res.json() as Promise<{ cleared: number }>;
}

export function logout() {
  localStorage.removeItem('apexgate_token');
}

export async function mintClientToken() {
  const res = await fetch(`${API}/admin/token`, { method: 'POST', headers: headers() });
  if (!res.ok) throw new Error('Failed to mint token');
  return res.json() as Promise<{ token: string }>;
}
