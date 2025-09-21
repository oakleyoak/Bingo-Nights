-- Migration: Add points system and daily login rewards
-- Date: 2025-09-21

-- Add new columns to profiles table
alter table profiles add column if not exists level integer default 1;
alter table profiles add column if not exists experience_points integer default 0;
alter table profiles add column if not exists last_login_date date;
alter table profiles add column if not exists consecutive_login_days integer default 0;

-- Update existing profiles to have default values
update profiles set level = 1 where level is null;
update profiles set experience_points = 0 where experience_points is null;
update profiles set consecutive_login_days = 0 where consecutive_login_days is null;

-- Function to calculate daily login reward based on level and consecutive days
create or replace function calculate_daily_reward(player_level integer, consecutive_days integer)
returns integer
language plpgsql
as $$
declare
  base_reward integer := 10;
  level_multiplier numeric := 1 + (player_level - 1) * 0.1; -- 10% increase per level
  consecutive_bonus numeric := 1 + (consecutive_days - 1) * 0.05; -- 5% bonus per consecutive day
begin
  return round(base_reward * level_multiplier * consecutive_bonus)::integer;
end;
$$;

-- Function to process daily login and award points
create or replace function process_daily_login(user_id uuid)
returns jsonb
language plpgsql
as $$
declare
  user_profile profiles%rowtype;
  today_date date := current_date;
  days_since_last_login integer;
  new_consecutive_days integer;
  reward_points integer;
  xp_gained integer := 5; -- Base XP for daily login
  old_level integer;
  new_level integer;
  level_threshold integer;
  leveled_up boolean := false;
begin
  -- Get current user profile
  select * into user_profile from profiles where id = user_id;
  if not found then
    -- Create profile if it doesn't exist
    insert into profiles (id, points, level, experience_points, consecutive_login_days)
    values (user_id, 100, 1, 0, 0);
    select * into user_profile from profiles where id = user_id;
  end if;

  old_level := user_profile.level;

  -- Calculate days since last login
  if user_profile.last_login_date is null then
    days_since_last_login := 1;
  else
    days_since_last_login := today_date - user_profile.last_login_date;
  end if;

  -- Determine consecutive days
  if days_since_last_login = 1 then
    new_consecutive_days := user_profile.consecutive_login_days + 1;
  else
    new_consecutive_days := 1;
  end if;

  -- Calculate reward
  reward_points := calculate_daily_reward(user_profile.level, new_consecutive_days);

  -- Calculate XP bonus for consecutive logins
  xp_gained := xp_gained + (new_consecutive_days - 1) * 2; -- +2 XP per consecutive day

  -- Update profile with points and XP
  update profiles
  set points = points + reward_points,
      experience_points = experience_points + xp_gained,
      last_login_date = today_date,
      consecutive_login_days = new_consecutive_days,
      updated_at = now()
  where id = user_id;

  -- Check for level up
  select * into user_profile from profiles where id = user_id;
  new_level := user_profile.level;

  -- Level up logic: level * 100 XP required
  level_threshold := new_level * 100;
  while user_profile.experience_points >= level_threshold loop
    user_profile.experience_points := user_profile.experience_points - level_threshold;
    new_level := new_level + 1;
    leveled_up := true;
    level_threshold := new_level * 100;
  end loop;

  -- Update level and XP if leveled up
  if new_level > old_level then
    update profiles
    set level = new_level,
        experience_points = user_profile.experience_points,
        updated_at = now()
    where id = user_id;
  end if;

  return jsonb_build_object(
    'points_awarded', reward_points,
    'xp_awarded', xp_gained,
    'consecutive_days', new_consecutive_days,
    'leveled_up', leveled_up,
    'old_level', old_level,
    'new_level', new_level
  );
end;
$$;