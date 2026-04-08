-- Add duration_seconds to workout_logs
-- This stores the total session duration in seconds
alter table workout_logs
  add column if not exists duration_seconds integer;
