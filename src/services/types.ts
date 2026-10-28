import type { AssetRef, PortfolioData, Session } from '../types';

export type AssetScope = 'draft' | 'public';

export interface PortfolioRepository {
  getPublished(): Promise<PortfolioData>;
  getDraft(): Promise<PortfolioData>;
  saveDraft(data: PortfolioData): Promise<PortfolioData>;
  publish(data: PortfolioData): Promise<PortfolioData>;
  discardDraft(): Promise<PortfolioData>;

  uploadAsset(file: File, scope: AssetScope): Promise<AssetRef>;
  deleteAsset(path: string): Promise<void>;

  getSession(): Promise<Session | null>;
  signIn(email: string, password: string): Promise<Session>;
  signOut(): Promise<void>;
  onAuthChange(cb: (session: Session | null, event: string) => void): () => void;
  
  resetPasswordForEmail(email: string): Promise<void>;
  updatePassword(password: string): Promise<void>;

  readonly secure: true;
}