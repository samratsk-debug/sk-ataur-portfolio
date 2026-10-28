import { useEffect, useState } from 'react';
import type { SessionApi } from '../hooks/usePortfolioSession';
import { EditorShell } from './EditorShell';
import { EditorSkeleton } from '../components/Skeletons';

export function EditorApp({ session }: { session: SessionApi }) {
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (session.loading) {
      const t = setTimeout(() => setShowSkeleton(true), 150);
      return () => clearTimeout(t);
    } else {
      setShowSkeleton(false);
    }
  }, [session.loading]);

  if (session.loading) {
    return showSkeleton ? <EditorSkeleton /> : <div style={{ background: '#0A0F1F', minHeight: '100vh' }} />;
  }
  
  if (session.error) {
    return (
      <div className="editor-shell editor-centered">
        <p>{session.error}</p>
        <p className="muted">See README.md for Supabase setup.</p>
      </div>
    );
  }
  
  if (!session.repo) {
    return <div className="editor-shell editor-centered">Backend is not configured.</div>;
  }

  // App.tsx guarantees this is an owner, but double-check for safety
  if (session.session?.user.role !== 'owner') {
    return <div className="editor-shell editor-centered">Access Denied</div>;
  }

  return <EditorShell session={session} />;
}