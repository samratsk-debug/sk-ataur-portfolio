-- ============================================================================
-- Portfolio — initial schema + RLS + storage
-- Run once in Supabase SQL Editor as the project owner.
-- ============================================================================

-- ─── Owners table ────────────────────────────────────────────────────────────
create table if not exists public.portfolio_owners (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ─── Draft ───────────────────────────────────────────────────────────────────
create table if not exists public.portfolio_draft (
  owner_id uuid primary key references public.portfolio_owners(user_id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- ─── Published ───────────────────────────────────────────────────────────────
create table if not exists public.portfolio_published (
  owner_id uuid primary key references public.portfolio_owners(user_id) on delete cascade,
  data jsonb not null,
  published_at timestamptz not null default now()
);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table public.portfolio_owners    enable row level security;
alter table public.portfolio_draft     enable row level security;
alter table public.portfolio_published enable row level security;

-- ─── Policies — owners ───────────────────────────────────────────────────────
drop policy if exists "owners read self" on public.portfolio_owners;
create policy "owners read self"
  on public.portfolio_owners for select to authenticated
  using (user_id = auth.uid());

-- ─── Policies — draft ────────────────────────────────────────────────────────
drop policy if exists "owner reads own draft"   on public.portfolio_draft;
drop policy if exists "owner writes own draft"  on public.portfolio_draft;
drop policy if exists "owner updates own draft" on public.portfolio_draft;
drop policy if exists "owner deletes own draft" on public.portfolio_draft;

create policy "owner reads own draft"
  on public.portfolio_draft for select to authenticated
  using (owner_id = auth.uid());

create policy "owner writes own draft"
  on public.portfolio_draft for insert to authenticated
  with check (
    owner_id = auth.uid()
    and exists (select 1 from public.portfolio_owners where user_id = auth.uid())
  );

create policy "owner updates own draft"
  on public.portfolio_draft for update to authenticated
  using (owner_id = auth.uid())
  with check (
    owner_id = auth.uid()
    and exists (select 1 from public.portfolio_owners where user_id = auth.uid())
  );

create policy "owner deletes own draft"
  on public.portfolio_draft for delete to authenticated
  using (owner_id = auth.uid());

-- ─── Policies — published ────────────────────────────────────────────────────
drop policy if exists "anyone reads published"   on public.portfolio_published;
drop policy if exists "owner writes published"   on public.portfolio_published;
drop policy if exists "owner updates published"  on public.portfolio_published;
drop policy if exists "owner deletes published"  on public.portfolio_published;

create policy "anyone reads published"
  on public.portfolio_published for select to anon, authenticated
  using (true);

create policy "owner writes published"
  on public.portfolio_published for insert to authenticated
  with check (
    owner_id = auth.uid()
    and exists (select 1 from public.portfolio_owners where user_id = auth.uid())
  );

create policy "owner updates published"
  on public.portfolio_published for update to authenticated
  using (owner_id = auth.uid())
  with check (
    owner_id = auth.uid()
    and exists (select 1 from public.portfolio_owners where user_id = auth.uid())
  );

create policy "owner deletes published"
  on public.portfolio_published for delete to authenticated
  using (owner_id = auth.uid());

-- ─── Storage bucket ──────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('portfolio-assets', 'portfolio-assets', false)
on conflict (id) do update set public = false;

-- ─── Storage policies ────────────────────────────────────────────────────────
drop policy if exists "owner manages own assets"        on storage.objects;
drop policy if exists "public reads published assets"   on storage.objects;

create policy "owner manages own assets"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'portfolio-assets'
    and split_part(name, '/', 2) = auth.uid()::text
    and exists (select 1 from public.portfolio_owners where user_id = auth.uid())
  )
  with check (
    bucket_id = 'portfolio-assets'
    and split_part(name, '/', 2) = auth.uid()::text
    and exists (select 1 from public.portfolio_owners where user_id = auth.uid())
  );

create policy "public reads published assets"
  on storage.objects for select to anon, authenticated
  using (
    bucket_id = 'portfolio-assets'
    and split_part(name, '/', 1) = 'public'
  );