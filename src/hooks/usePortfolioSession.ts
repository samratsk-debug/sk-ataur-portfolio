import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AssetRef, PortfolioData, Session } from '../types';
import { getRepository } from '../services';
import type { AssetScope, PortfolioRepository } from '../services/types';

export interface SessionApi {
  repo: PortfolioRepository | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  published: PortfolioData | null;
  draft: PortfolioData | null;
  isRecovering: boolean;
  setIsRecovering: (val: boolean) => void;
  refresh: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  saveDraft: (data: PortfolioData) => Promise<PortfolioData>;
  publish: (data: PortfolioData) => Promise<PortfolioData>;
  discardDraft: () => Promise<PortfolioData>;
  uploadAsset: (file: File, scope: AssetScope) => Promise<AssetRef>;
  deleteAsset: (path: string) => Promise<void>;
}

export function usePortfolioSession(): SessionApi {
  const repoState = useMemo(() => {
    try {
      return { repo: getRepository(), error: null as string | null };
    } catch (e) {
      return { repo: null, error: e instanceof Error ? e.message : 'Config error' };
    }
  }, []);
  const repo = repoState.repo;

  const [session, setSession] = useState<Session | null>(null);
  const [published, setPublished] = useState<PortfolioData | null>(null);
  const [draft, setDraft] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(repoState.error);
  const [isRecovering, setIsRecovering] = useState(false);

  const refresh = useCallback(async () => {
    if (!repo) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const s = await repo.getSession();
      setSession(s);
      const pub = await repo.getPublished();
      setPublished(pub);
      if (s?.user.role === 'owner') setDraft(await repo.getDraft());
      else setDraft(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [repo]);

  useEffect(() => {
    if (!repo) { setLoading(false); return; }
    void refresh();
  }, [repo, refresh]);

  useEffect(() => {
    if (!repo) return;
    return repo.onAuthChange((newSession, event) => {
      setSession(newSession);
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovering(true);
      } else if (event === 'SIGNED_OUT') {
        setDraft(null);
        setIsRecovering(false);
      } else {
        void refresh();
      }
    });
  }, [repo, refresh]);

  return {
    repo, session, loading, error, published, draft, isRecovering, setIsRecovering,
    refresh,
    signIn: async (e, p) => { if (!repo) throw new Error('Not configured'); await repo.signIn(e, p); await refresh(); },
    signOut: async () => { if (!repo) return; await repo.signOut(); setSession(null); setDraft(null); },
    saveDraft: async (d) => { if (!repo) throw new Error('Not configured'); const saved = await repo.saveDraft(d); setDraft(saved); return saved; },
    publish: async (d) => { if (!repo) throw new Error('Not configured'); const pub = await repo.publish(d); setPublished(pub); setDraft(pub); return pub; },
    discardDraft: async () => { if (!repo) throw new Error('Not configured'); const d = await repo.discardDraft(); setDraft(d); return d; },
    uploadAsset: async (f, scope) => { if (!repo) throw new Error('Not configured'); return repo.uploadAsset(f, scope); },
    deleteAsset: async (path) => { if (!repo) throw new Error('Not configured'); return repo.deleteAsset(path); }
  };
}