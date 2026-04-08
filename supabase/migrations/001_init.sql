-- ============================================================
-- proGym — Initial Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- PROFILES
-- ──────────────────────────────────────────────────────────
create table if not exists profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  name                  text not null default '',
  username              text not null default '',
  onboarding_completed  boolean not null default false,
  edad                  text,
  profesion             text,
  disponibilidad        text,
  equipamiento          text,
  nivel                 text,
  actualidad            text,
  objetivo              text[],
  peso                  text,
  altura                text,
  lesiones              text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function handle_updated_at();

-- ──────────────────────────────────────────────────────────
-- EXERCISES
-- type: 'C.C' (Cadena Cinética Cerrada) | 'C.A' (Cadena Abierta)
-- ──────────────────────────────────────────────────────────
create table if not exists exercises (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  type             text,
  muscle_group     text not null,
  movement_pattern text,
  equipment        text not null,
  difficulty       text,
  secondary_groups text,
  modalities       text,
  notes            text,
  created_at       timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────
-- ROUTINES  (LLM output stored as JSONB)
-- ──────────────────────────────────────────────────────────
create table if not exists routines (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  data       jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────
-- WORKOUT LOGS
-- Structure of `exercises` column:
-- [{ exercise_id, exercise_name, sets: [{ reps, weight }] }]
-- ──────────────────────────────────────────────────────────
create table if not exists workout_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  notes      text,
  exercises  jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ──────────────────────────────────────────────────────────
alter table profiles     enable row level security;
alter table exercises    enable row level security;
alter table routines     enable row level security;
alter table workout_logs enable row level security;

-- profiles: users can only access their own row
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- exercises: anyone authenticated can read, no writes from client
create policy "exercises_select_authenticated" on exercises
  for select using (auth.role() = 'authenticated');

-- routines: own rows only
create policy "routines_select_own" on routines
  for select using (auth.uid() = user_id);
create policy "routines_insert_own" on routines
  for insert with check (auth.uid() = user_id);
create policy "routines_delete_own" on routines
  for delete using (auth.uid() = user_id);

-- workout_logs: own rows only
create policy "logs_select_own" on workout_logs
  for select using (auth.uid() = user_id);
create policy "logs_insert_own" on workout_logs
  for insert with check (auth.uid() = user_id);
create policy "logs_delete_own" on workout_logs
  for delete using (auth.uid() = user_id);
