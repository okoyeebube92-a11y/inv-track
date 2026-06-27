-- ============================================================
-- INVENTORY APP — SUPABASE SCHEMA (Full)
-- Run this in Supabase SQL Editor
-- ============================================================

-- ENTRIES
create table if not exists entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  model      text not null,
  date       date not null,
  qty        integer not null check (qty > 0),
  unit       text not null check (unit in ('pcs', 'ctn')),
  created_at timestamptz default now()
);

-- EXITS
create table if not exists exits (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  model      text not null,
  date       date not null,
  qty        integer not null check (qty > 0),
  unit       text not null check (unit in ('pcs', 'ctn')),
  created_at timestamptz default now()
);

-- PROFILES (display name + role)
create table if not exists profiles (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  role         text not null default 'user' check (role in ('user', 'admin')),
  created_at   timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table entries  enable row level security;
alter table exits    enable row level security;
alter table profiles enable row level security;

-- ENTRIES
create policy "users view own entries"   on entries for select using (auth.uid() = user_id);
create policy "users insert own entries" on entries for insert with check (auth.uid() = user_id);
create policy "users update own entries" on entries for update using (auth.uid() = user_id);
create policy "users delete own entries" on entries for delete using (auth.uid() = user_id);
-- Admin can see all
create policy "admins view all entries"   on entries for select using (exists (select 1 from profiles where user_id = auth.uid() and role = 'admin'));
create policy "admins update all entries" on entries for update using (exists (select 1 from profiles where user_id = auth.uid() and role = 'admin'));
create policy "admins delete all entries" on entries for delete using (exists (select 1 from profiles where user_id = auth.uid() and role = 'admin'));

-- EXITS
create policy "users view own exits"   on exits for select using (auth.uid() = user_id);
create policy "users insert own exits" on exits for insert with check (auth.uid() = user_id);
create policy "users update own exits" on exits for update using (auth.uid() = user_id);
create policy "users delete own exits" on exits for delete using (auth.uid() = user_id);
create policy "admins view all exits"   on exits for select using (exists (select 1 from profiles where user_id = auth.uid() and role = 'admin'));
create policy "admins update all exits" on exits for update using (exists (select 1 from profiles where user_id = auth.uid() and role = 'admin'));
create policy "admins delete all exits" on exits for delete using (exists (select 1 from profiles where user_id = auth.uid() and role = 'admin'));

-- PROFILES
create policy "users view own profile"   on profiles for select using (auth.uid() = user_id);
create policy "users update own profile" on profiles for update using (auth.uid() = user_id);
create policy "users insert own profile" on profiles for insert with check (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists entries_user_id_idx on entries(user_id);
create index if not exists entries_model_idx   on entries(model);
create index if not exists entries_date_idx    on entries(date);
create index if not exists exits_user_id_idx   on exits(user_id);
create index if not exists exits_model_idx     on exits(model);
create index if not exists exits_date_idx      on exits(date);

-- ============================================================
-- TO MAKE A USER ADMIN — run this with their user ID:
-- update profiles set role = 'admin' where user_id = 'paste-user-uuid-here';
-- ============================================================
