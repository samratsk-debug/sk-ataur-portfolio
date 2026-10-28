import type { PortfolioRepository } from './types';
import { SupabaseRepository } from './supabaseRepository';
let instance: PortfolioRepository | null = null;
export function getRepository(): PortfolioRepository {
  if (instance) return instance;
  const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
  const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();
  if (!url || !anonKey) throw new Error('Supabase is not configured. Create .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  instance = new SupabaseRepository(url, anonKey);
  return instance;
}
export type { PortfolioRepository };