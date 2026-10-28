import { useState } from 'react';
import type { SessionApi } from '../hooks/usePortfolioSession';

export function SignIn({ session }: { session: SessionApi }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await session.signIn(email, password);
      // No need to manually change hash; the state update in usePortfolioSession triggers a re-render of EditorApp
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Sign-in failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="signin" onSubmit={submit} style={{ background: 'rgba(14, 20, 48, 0.65)', padding: 32, borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', width: 'min(420px, 100%)' }}>
      <h1 style={{ font: '700 24px Sora', margin: '0 0 8px', color: '#fff' }}>Owner Sign In</h1>
      <p className="muted" style={{ color: '#A5B0D0', fontSize: 14, marginBottom: 24 }}>Only the configured owner can edit this portfolio.</p>
      
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, font: '600 13px Inter', color: '#E8ECF6' }}>Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.06)', color: '#fff' }} />
      </label>
      
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, font: '600 13px Inter', color: '#E8ECF6', marginTop: 16 }}>Password
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.06)', color: '#fff' }} />
      </label>
      
      {err && <p style={{ color: '#FF9B9B', font: '500 13px Inter', margin: '12px 0 0' }}>{err}</p>}
      
      <button type="submit" disabled={busy} className="primary" style={{ marginTop: 24, padding: '12px', borderRadius: 8, border: 0, background: '#7C9CFF', color: '#0A0F1F', font: '600 14px Inter', cursor: 'pointer', width: '100%' }}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
      
      <button type="button" onClick={() => session.setIsRecovering(true)} style={{ background: 'transparent', border: 'none', color: '#A5B0D0', fontSize: 13, textDecoration: 'underline', marginTop: 16, cursor: 'pointer' }}>
        Forgot password?
      </button>
    </form>
  );
}