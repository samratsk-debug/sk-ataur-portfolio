import { createContext, useContext } from 'react';
import type { AssetRef, PortfolioData } from '../types';
import type { AssetScope } from '../services/types';

export interface EditorApi {
  draft: PortfolioData;
  setDraft: (updater: (prev: PortfolioData) => PortfolioData) => void;
  dirty: boolean;
  uploadAsset: (file: File, scope: AssetScope) => Promise<AssetRef>;
  deleteAsset: (path: string) => Promise<void>;
  toast: (msg: string, type: 'ok' | 'err') => void;
}

export const EditorContext = createContext<EditorApi | null>(null);

export function useEditor(): EditorApi {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used inside <EditorContext.Provider>');
  return ctx;
}