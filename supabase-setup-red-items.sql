-- Run this once in your Supabase project's SQL Editor, same place you ran
-- supabase-setup.sql. This is additive — it does not touch the builds table.

create table if not exists red_items (
  id uuid primary key default gen_random_uuid(),
  game_id text not null,
  name text not null,
  image_url text,
  value numeric not null,
  tag text not null check (tag in ('seasonal', 'permanent')),
  created_at timestamptz not null default now()
);

alter table red_items enable row level security;

create policy "public can read red items"
  on red_items for select
  using (true);

create policy "public can insert red items"
  on red_items for insert
  with check (true);

-- ---------------------------------------------------------------
-- Storage policies for the red-item-images bucket.
-- First create the bucket in the dashboard: Storage -> New bucket
-- -> name it "red-item-images" -> toggle "Public bucket" ON -> Create.
-- Then run the two policies below.
-- ---------------------------------------------------------------

create policy "public can read red item images"
  on storage.objects for select
  using (bucket_id = 'red-item-images');

create policy "public can upload red item images"
  on storage.objects for insert
  with check (bucket_id = 'red-item-images');
