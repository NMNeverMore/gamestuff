create extension if not exists pgcrypto;

create table if not exists builds (
  id uuid primary key default gen_random_uuid(),
  game_id text not null,
  title text not null,
  description text,
  image_url text,
  build_code text not null,
  author text,
  created_at timestamptz not null default now()
);

alter table builds enable row level security;

create policy "public can read builds"
  on builds for select
  using (true);

create policy "public can insert builds"
  on builds for insert
  with check (true);

create policy "public can read build images"
  on storage.objects for select
  using (bucket_id = 'build-images');

create policy "public can upload build images"
  on storage.objects for insert
  with check (bucket_id = 'build-images');
