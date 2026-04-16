-- ============================================================
-- proGym — Routine types, status, and progress tracking
-- ============================================================

-- Add type: 'daily' | 'weekly' | 'monthly'  (default weekly for existing)
alter table routines
  add column if not exists type    text not null default 'weekly',
  add column if not exists status  text not null default 'active',
  add column if not exists progress jsonb not null default '{"completed_days": []}';

-- Allow users to update their own routines (needed for progress tracking)
create policy "routines_update_own" on routines
  for update using (auth.uid() = user_id);
