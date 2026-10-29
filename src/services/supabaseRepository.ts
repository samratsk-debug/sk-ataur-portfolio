import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AssetRef, PortfolioData, Session } from '../types';
import type { AssetScope, PortfolioRepository } from './types';
import { portfolioData as defaultPortfolio } from '../data/portfolio';
import { migrateData } from '../data/migrate';

const BUCKET = 'portfolio-assets';
const DRAFT_EXPIRY = 7 * 24 * 60 * 60;
const PUBLISHED_EXPIRY = 365 * 24 * 60 * 60;

function* iterAssets(data: PortfolioData): Generator<AssetRef> {
  if (data.profile?.photo) yield data.profile.photo;
  for (const p of data.projects ?? []) if (p.thumb) yield p.thumb;
  for (const c of data.creative ?? []) if (c.image) yield c.image;
  for (const cs of data.customSections ?? []) {
    for (const item of cs.items ?? []) {
      if (item.img) yield { assetId: '', path: item.img, bucket: BUCKET, url: item.img };
    }
  }
}

function mapAssets(data: PortfolioData, fn: (a: AssetRef) => AssetRef): PortfolioData {
  return {
    ...data,
    profile: { ...data.profile, photo: data.profile.photo ? fn(data.profile.photo) : null },
    projects: (data.projects ?? []).map((p) => ({ ...p, thumb: p.thumb ? fn(p.thumb) : null })),
    creative: (data.creative ?? []).map((c) => ({ ...c, image: c.image ? fn(c.image) : null })),
    customSections: (data.customSections ?? []).map(cs => ({
      ...cs,
      items: (cs.items || []).map(item => ({
        ...item,
        img: item.img ? fn({ assetId: '', path: item.img, bucket: BUCKET, url: item.img }).url : ''
      }))
    }))
  };
}

export class SupabaseRepository implements PortfolioRepository {
  readonly secure = true as const;
  public supabase: SupabaseClient;

  constructor(url: string, anonKey: string) {
    this.supabase = createClient(url, anonKey, {
      auth: { 
        persistSession: true, 
        autoRefreshToken: true, 
        detectSessionInUrl: true, 
        storageKey: 'sk-portfolio-auth',
        storage: window.sessionStorage // THIS FIXES THE SESSION EXPIRY
      },
    });
  }

  private async isOwner(userId: string): Promise<boolean> {
    const { data, error } = await this.supabase.from('portfolio_owners').select('user_id').eq('user_id', userId).maybeSingle();
    if (error) return false;
    return Boolean(data);
  }

  async getSession(): Promise<Session | null> {
    const { data } = await this.supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) return null;
    const owner = await this.isOwner(user.id);
    return { user: { id: user.id, email: user.email ?? '', role: owner ? 'owner' : 'visitor' } };
  }

  async signIn(email: string, password: string): Promise<Session> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    const user = data.user;
    if (!user) throw new Error('Sign-in succeeded but no user was returned.');
    const owner = await this.isOwner(user.id);
    if (!owner) {
      await this.supabase.auth.signOut();
      throw new Error('This account is not authorized to edit this portfolio.');
    }
    return { user: { id: user.id, email: user.email ?? '', role: 'owner' } };
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }

  async resetPasswordForEmail(email: string): Promise<void> {
    const redirectTo = `${window.location.origin}/#/admin`;
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw new Error(error.message);
  }

  async updatePassword(password: string): Promise<void> {
    const { error } = await this.supabase.auth.updateUser({ password });
    if (error) throw new Error(error.message);
  }

  onAuthChange(cb: (session: Session | null, event: string) => void): () => void {
    const { data } = this.supabase.auth.onAuthStateChange(async (event, authSession) => {
      if (!authSession?.user) {
        cb(null, event);
        return;
      }
      const owner = await this.isOwner(authSession.user.id);
      cb({ user: { id: authSession.user.id, email: authSession.user.email ?? '', role: owner ? 'owner' : 'visitor' } }, event);
    });
    return () => data.subscription.unsubscribe();
  }

  async getPublished(): Promise<PortfolioData> {
    const { data, error } = await this.supabase.from('portfolio_published').select('data').limit(1).maybeSingle();
    if (error) throw new Error(`Load failed: ${error.message}`);
    return migrateData((data?.data as PortfolioData) ?? defaultPortfolio);
  }

  async getDraft(): Promise<PortfolioData> {
    const { data, error } = await this.supabase.from('portfolio_draft').select('data').maybeSingle();
    if (error) throw new Error(`Draft failed: ${error.message}`);
    const source = (data?.data as PortfolioData | undefined) ?? (await this.getPublished());
    return this.resignAssets(migrateData(source), DRAFT_EXPIRY);
  }

  async saveDraft(input: PortfolioData): Promise<PortfolioData> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated.');
    const now = new Date().toISOString();
    const data = { ...input, updatedAt: now };
    const { error } = await this.supabase.from('portfolio_draft').upsert({ owner_id: user.id, data, updated_at: now }, { onConflict: 'owner_id' });
    if (error) throw new Error(`Save failed: ${error.message}`);
    return data;
  }

  async publish(input: PortfolioData): Promise<PortfolioData> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated.');
    const processed = await this.processForPublish(input, user.id);
    const now = new Date().toISOString();
    const finalData = { ...processed, updatedAt: now, publishedAt: now };
    const { error } = await this.supabase.from('portfolio_published').upsert({ owner_id: user.id, data: finalData, published_at: now }, { onConflict: 'owner_id' });
    if (error) throw new Error(`Publish failed: ${error.message}`);
    await this.supabase.from('portfolio_draft').upsert({ owner_id: user.id, data: finalData, updated_at: now }, { onConflict: 'owner_id' });
    return finalData;
  }

  async discardDraft(): Promise<PortfolioData> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated.');
    const { data: pub, error } = await this.supabase.from('portfolio_published').select('data').eq('owner_id', user.id).maybeSingle();
    if (error || !pub) throw new Error('No published portfolio.');
    const draft = await this.resignAssets(migrateData(pub.data as PortfolioData), DRAFT_EXPIRY);
    const now = new Date().toISOString();
    await this.supabase.from('portfolio_draft').upsert({ owner_id: user.id, data: draft, updated_at: now }, { onConflict: 'owner_id' });
    return draft;
  }

  async uploadAsset(file: File, scope: AssetScope): Promise<AssetRef> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated.');
    if (!file.type.startsWith('image/')) throw new Error('File must be an image.');
    if (file.size > 4 * 1024 * 1024) throw new Error('Image is larger than 4 MB.');
    const ext = (file.name.split('.').pop() ?? 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
    const path = `${scope}/${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await this.supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
    if (upErr) throw new Error(`Upload failed: ${upErr.message}`);
    const { data: signed, error: signErr } = await this.supabase.storage.from(BUCKET).createSignedUrl(path, scope === 'draft' ? DRAFT_EXPIRY : PUBLISHED_EXPIRY);
    if (signErr || !signed) throw new Error('URL sign failed.');
    return { assetId: crypto.randomUUID(), path, bucket: BUCKET, url: signed.signedUrl, mime: file.type, size: file.size };
  }

  async deleteAsset(path: string): Promise<void> {
    const { error } = await this.supabase.storage.from(BUCKET).remove([path]);
    if (error) console.warn('Delete failed:', error.message);
  }

  private async resignAssets(data: PortfolioData, expirySeconds: number): Promise<PortfolioData> {
    const paths = [...new Set([...iterAssets(data)].map((a) => a.path))];
    if (!paths.length) return data;
    const { data: signed, error } = await this.supabase.storage.from(BUCKET).createSignedUrls(paths, expirySeconds);
    if (error) throw new Error(`Sign failed: ${error.message}`);
    const urlMap = new Map<string, string>();
    for (const item of signed ?? []) if (item.signedUrl) urlMap.set(item.path, item.signedUrl);
    return mapAssets(data, (a) => ({ ...a, url: urlMap.get(a.path) ?? a.url }));
  }

  private async processForPublish(data: PortfolioData, userId: string): Promise<PortfolioData> {
    const pathMap = new Map<string, string>();
    for (const asset of iterAssets(data)) {
      if (asset.path.startsWith('public/') || pathMap.has(asset.path)) continue;
      const filename = asset.path.split('/').pop();
      if (!filename) continue;
      const publicPath = `public/${userId}/${filename}`;
      const { data: blob, error: dlErr } = await this.supabase.storage.from(BUCKET).download(asset.path);
      if (dlErr || !blob) throw new Error(`Copy read failed: ${dlErr?.message}`);
      await this.supabase.storage.from(BUCKET).upload(publicPath, blob, { contentType: blob.type, upsert: true });
      pathMap.set(asset.path, publicPath);
    }
    return this.resignAssets(mapAssets(data, (a) => ({ ...a, path: pathMap.get(a.path) ?? a.path })), PUBLISHED_EXPIRY);
  }
}