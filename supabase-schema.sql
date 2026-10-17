-- Run this in Supabase SQL Editor

-- Categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image_url text,
  created_at timestamptz default now()
);

-- Products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price integer not null,
  category_id uuid references categories(id) on delete set null,
  image_url text,
  is_available boolean default true,
  weight_gram integer default 500,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Store settings (single row)
create table if not exists store_settings (
  id integer primary key default 1,
  store_name text default 'Katresna',
  whatsapp_number text,
  address text,
  pickup_enabled boolean default false,
  is_open boolean default true,
  origin_district_id text,
  origin_city_id text,
  origin_province_id text
);

-- Insert default settings
insert into store_settings (id, store_name, address, whatsapp_number, pickup_enabled, is_open)
values (1, 'Katresna', 'Jalan abc no 83 Banceuy, Bandung', '628xxxxxxxxxx', false, true)
on conflict (id) do nothing;

-- Seed categories
insert into categories (name, slug) values
  ('Beverages', 'beverages'),
  ('Bolen', 'bolen'),
  ('Box', 'box')
on conflict (slug) do nothing;

-- Storage bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- RLS Policies
alter table products enable row level security;
alter table categories enable row level security;
alter table store_settings enable row level security;

-- Public read access
create policy "Public read products" on products for select using (true);
create policy "Public read categories" on categories for select using (true);
create policy "Public read settings" on store_settings for select using (true);

-- Admin write access (authenticated users only)
create policy "Auth write products" on products for all using (auth.role() = 'authenticated');
create policy "Auth write categories" on categories for all using (auth.role() = 'authenticated');
create policy "Auth write settings" on store_settings for all using (auth.role() = 'authenticated');

-- Storage policy
create policy "Public read images" on storage.objects for select using (bucket_id = 'product-images');
create policy "Auth upload images" on storage.objects for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated');
create policy "Auth update images" on storage.objects for update using (bucket_id = 'product-images' and auth.role() = 'authenticated');
create policy "Auth delete images" on storage.objects for delete using (bucket_id = 'product-images' and auth.role() = 'authenticated');
