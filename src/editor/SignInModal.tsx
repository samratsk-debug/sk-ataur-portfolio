import { useState, useEffect } from 'react';
import type { SessionApi } from '../hooks/usePortfolioSession';

export function SignInModal({ session, onClose }: { session: SessionApi; onClose: () => void }) {
  const [mode, setMode] = useState<'signin' | 'reset_request' | 'reset_update'>(
    session.isRecovering ? 'reset_update' : 'signin'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // If the recovery event fires while the modal is open, switch modes
    if (session.isRecovering) setMode('reset_update');
  }, [session.isRecovering]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null); setBusy(true);
    try {
      await session.signIn(email, password);
      onClose();
      window.location.hash = '#/admin';
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Sign-in failed.');
    } finally { setBusy(false); }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null); setBusy(true);
    try {
      if (!session.repo) throw new Error('Backend not configured');
      await session.repo.resetPasswordForEmail(email);
      setSuccess(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Reset request failed.');
    } finally { setBusy(false); }
  };

  const handleResetUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (newPassword !== confirmPassword) { setErr('Passwords do not match.'); return; }
    if (newPassword.length < 6) { setErr('Password must be at least 6 characters.'); return; }
    
    setErr(null); setBusy(true);
    try {
      if (!session.repo) throw new Error('Backend not configured');
      await session.repo.updatePassword(newPassword);
      setSuccess(true);
      session.setIsRecovering(false); // Clear the recovery state
      setTimeout(() => { 
        setMode('signin'); 
        setSuccess(false); 
        window.history.replaceState(null, '', window.location.pathname + '#/admin');
      }, 3000);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Password update failed.');
    } finally { setBusy(false); }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content glass-panel chromatic-border auth-modal">
        <button type="button" className="modal-close" onClick={onClose}>×</button>
        
        {mode === 'signin' && (
          <>
            <div className="auth-header">
              <h2>Owner Sign In</h2>
              <p className="muted">Only the authorized owner can edit this portfolio.</p>
            </div>
            <form onSubmit={handleSignIn}>
              <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
              <label>Password
                <div className="pw-wrap">
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPw(!showPw)}>{showPw ? 'Hide' : 'Show'}</button>
                </div>
              </label>
              {err && <p className="error-msg">{err}</p>}
              <div className="modal-actions">
                <button type="button" className="link" onClick={() => { setMode('reset_request'); setErr(null); setSuccess(false); }}>Forgot password?</button>
                <button type="submit" className="primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
              </div>
            </form>
          </>
        )}

        {mode === 'reset_request' && (
          <>
            <div className="auth-header">
              <h2>Reset Password</h2>
              <p className="muted">We'll send a recovery link to your email.</p>
            </div>
            {success ? (
              <div className="success-msg">If an account exists for this address, a password recovery email will be sent.</div>
            ) : (
              <form onSubmit={handleResetRequest}>
                <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
                {err && <p className="error-msg">{err}</p>}
                <div className="modal-actions">
                  <button type="button" className="link" onClick={() => setMode('signin')}>Back to sign in</button>
                  <button type="submit" className="primary" disabled={busy}>{busy ? 'Sending…' : 'Send Link'}</button>
                </div>
              </form>
            )}
          </>
        )}

        {mode === 'reset_update' && (
          <>
            <div className="auth-header">
              <h2>Set New Password</h2>
              <p className="muted">Enter your new password below.</p>
            </div>
            {success ? (
              <div className="success-msg">Password updated! Redirecting to sign in...</div>
            ) : (
              <form onSubmit={handleResetUpdate}>
                <label>New Password
                  <div className="pw-wrap">
                    <input type={showPw ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowPw(!showPw)}>{showPw ? 'Hide' : 'Show'}</button>
                  </div>
                </label>
                <label>Confirm Password<input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></label>
                {err && <p className="error-msg">{err}</p>}
                <div className="modal-actions">
                  <button type="submit" className="primary" disabled={busy}>{busy ? 'Updating…' : 'Update Password'}</button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}