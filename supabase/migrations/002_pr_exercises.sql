-- Add pr_exercises column to persist each user's selected PR exercises
alter table profiles
  add column if not exists pr_exercises text[] not null default '{}';
