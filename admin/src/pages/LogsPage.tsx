import { useEffect, useState } from 'react';
import { fetchLogs } from '../api';
import type { RequestLog } from '../types';

export default function LogsPage() {
  const [logs, setLogs] = useState<RequestLog[]>([]);

  useEffect(() => {
    fetchLogs(100).then(setLogs);
    const id = setInterval(() => fetchLogs(100).then(setLogs), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <h1 className="page-title">Request Logs</h1>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Method</th>
              <th>Path</th>
              <th>Status</th>
              <th>Duration</th>
              <th>Cache</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={6} style={{ color: 'var(--muted)' }}>No requests yet — hit a gateway route</td></tr>
            ) : logs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
                <td>{log.method}</td>
                <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{log.path}</td>
                <td><span className={`badge ${log.status < 400 ? 'ok' : 'warn'}`}>{log.status}</span></td>
                <td>{log.durationMs}ms</td>
                <td>{log.cached ? 'HIT' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
