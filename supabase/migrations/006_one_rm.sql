-- Add one_rm column to profiles to store manually entered 1RM values per exercise
-- Structure: { "Exercise Name": 120.5, ... }
alter table profiles
  add column if not exists one_rm jsonb not null default '{}';
