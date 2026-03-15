import { useState } from 'react';
import { mintClientToken } from '../api';

export default function TokenPage() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleMint() {
    setLoading(true);
    setError('');
    try {
      const data = await mintClientToken();
      setToken(data.token);
    } catch {
      setError('Failed to mint token');
    } finally {
      setLoading(false);
    }
  }

  function copyToken() {
    if (token) navigator.clipboard.writeText(token);
  }

  return (
    <section>
      <h1 className="page-title">Client Tokens</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
        Mint JWT tokens for API consumers. Use these on routes with JWT Required enabled.
      </p>
      <div className="card" style={{ maxWidth: 640 }}>
        <button onClick={handleMint} disabled={loading}>
          {loading ? 'Minting…' : 'Mint Client Token'}
        </button>
        {error && <p style={{ color: 'var(--danger)', marginTop: '1rem' }}>{error}</p>}
        {token && (
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Token</label>
            <textarea readOnly value={token} rows={4} style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.8rem' }} />
            <button style={{ marginTop: '0.75rem' }} onClick={copyToken}>Copy to clipboard</button>
          </div>
        )}
      </div>
    </section>
  );
}
