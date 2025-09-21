-- Migration: Add missing columns to profiles table
-- Date: 2025-09-21

-- Add missing columns to profiles table
alter table profiles add column if not exists level integer default 1;
alter table profiles add column if not exists experience_points integer default 0;
alter table profiles add column if not exists last_login_date date;
alter table profiles add column if not exists consecutive_login_days integer default 0;
alter table profiles add column if not exists total_games_played integer default 0;
alter table profiles add column if not exists total_bingos integer default 0;
alter table profiles add column if not exists best_placement integer;
alter table profiles add column if not exists avatar_url text;
alter table profiles add column if not exists created_at timestamptz default now();
alter table profiles add column if not exists updated_at timestamptz default now();

-- Update existing profiles to have default values
update profiles set level = 1 where level is null;
update profiles set experience_points = 0 where experience_points is null;
update profiles set consecutive_login_days = 0 where consecutive_login_days is null;
update profiles set total_games_played = 0 where total_games_played is null;
update profiles set total_bingos = 0 where total_bingos is null;