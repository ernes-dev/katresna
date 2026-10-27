-- Bolen Katresna — plain PostgreSQL schema (post-Supabase)
-- Run once on the fresh `katresna` database:
--   psql "postgresql://katresna_app:PASSWORD@localhost:5432/katresna" -f db/schema.sql

create extension if not exists pgcrypto;  -- gen_random_uuid()

-- ---------- Auth ----------
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  password_hash text not null,
  created_at    timestamptz not null default now()
);

-- ---------- Catalog ----------
create table if not exists categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  price         numeric not null default 0,
  image_url     text,
  is_available  boolean not null default true,
  stock         integer not null default 0,
  category_id   uuid references categories(id) on delete set null,
  variants      jsonb,
  is_custom_box boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ---------- Store settings (single row id=1) ----------
create table if not exists store_settings (
  id             integer primary key default 1,
  is_open        boolean not null default true,
  open_time      text,
  close_time     text,
  sat_open_time  text,
  store_hours    text,
  address        text,
  maps_url       text,
  instagram_url  text,
  whatsapp_number text,
  constraint store_settings_singleton check (id = 1)
);

-- ---------- Banners / flyers ----------
create table if not exists banners (
  id          uuid primary key default gen_random_uuid(),
  image_url   text not null,
  order_index integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------- Mitra (reseller/jastiper/admin/owner) ----------
create table if not exists resellers (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references users(id) on delete cascade,
  full_name     text not null,
  email         text,
  phone         text,
  kyc_photo_url text,
  kyc_status    text not null default 'pending',   -- pending|approved|rejected
  kyc_notes     text,
  bank_name     text,
  bank_account  text,
  bank_holder   text,
  bank_status   text not null default 'pending',   -- pending|approved|rejected
  is_active     boolean not null default false,
  role          text not null default 'reseller',  -- reseller|jastiper|admin|owner
  ref_code      text unique,
  created_at    timestamptz not null default now()
);

-- ---------- Commission tiers ----------
create table if not exists commission_tiers (
  id        serial primary key,
  min_sales integer not null default 0,
  max_sales integer,
  type      text not null default 'percent',        -- percent|fixed
  value     numeric not null default 0,
  label     text not null default ''
);

-- ---------- Commissions ----------
create table if not exists commissions (
  id                uuid primary key default gen_random_uuid(),
  reseller_id       uuid references resellers(id) on delete cascade,
  order_ref         text,
  order_amount      numeric not null default 0,
  commission_amount numeric not null default 0,
  status            text not null default 'pending', -- pending|paid
  notes             text,
  created_at        timestamptz not null default now()
);

-- ---------- Orders ----------
create table if not exists orders (
  id               uuid primary key default gen_random_uuid(),
  customer_name    text not null,
  customer_whatsapp text,
  items            jsonb not null default '[]'::jsonb,
  subtotal         numeric not null default 0,
  service_fee      numeric not null default 0,
  shipping_method  text,
  address          text,
  courier          text,
  notes            text,
  status           text not null default 'pending',  -- pending|processing|done|cancelled
  reseller_id      uuid references resellers(id) on delete set null,
  created_at       timestamptz not null default now()
);

create index if not exists idx_orders_created   on orders (created_at desc);
create index if not exists idx_orders_reseller  on orders (reseller_id);
create index if not exists idx_commissions_res  on commissions (reseller_id);
create index if not exists idx_products_cat      on products (category_id);

-- ---------- Seed: store settings ----------
insert into store_settings (id, is_open, open_time, close_time, store_hours, address)
values (1, true, '07:00', '21:30', '07.00 – 21.30 (Sabtu 07.30 – 21.30)', 'Bandung')
on conflict (id) do nothing;

-- ---------- Seed: commission tiers ----------
insert into commission_tiers (min_sales, max_sales, type, value, label) values
  (0,   9,    'percent', 5,  'Bronze'),
  (10,  50,   'percent', 7,  'Silver'),
  (51,  null, 'percent', 10, 'Gold')
on conflict do nothing;

-- ---------- Seed: categories ----------
insert into categories (name) values ('Box'), ('Bolen'), ('Beverages')
on conflict do nothing;
